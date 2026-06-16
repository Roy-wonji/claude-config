---
name: rxswift-expert
description: "RxSwift 전문가 - Reactive Programming, MVVM-C, Memory Leak 방지, Observable/Observer 패턴 최적화, Disposable 관리, 스케줄러 활용, Hot/Cold Observable 분석, Subject 패턴, Error Handling 전문"
---

# RxSwift 전문가 스킬

**Reactive Programming with RxSwift** 전문 스킬로 iOS 앱에서 RxSwift를 활용한 반응형 프로그래밍을 최적화합니다.

## 🎯 핵심 전문 영역

### 📱 **RxSwift 기본 패턴**
- **Observable/Observer 패턴**: Cold/Hot Observable 최적화
- **Subject 활용**: PublishSubject, BehaviorSubject, ReplaySubject 활용
- **Operators**: map, flatMap, combineLatest, withLatestFrom 최적화
- **Schedulers**: MainScheduler, BackgroundScheduler 활용

### 🏗️ **MVVM-C + RxSwift 아키텍처**
- **ViewModel 설계**: Input/Output 패턴으로 명확한 데이터 플로우
- **Coordinator 패턴**: RxSwift 기반 네비게이션 관리
- **Dependency Injection**: RxSwift Observable과 DI 통합
- **Testing**: RxTest, RxBlocking을 통한 반응형 테스트

### 🔄 **Disposable 관리 & 메모리 최적화**
- **DisposeBag 패턴**: ViewController 생명주기와 연동
- **Retain Cycle 방지**: weak self, unowned 활용
- **Memory Leak 탐지**: Instruments + RxSwift 메모리 분석
- **Resource 관리**: dispose() vs disposed(by:) 최적화

### ⚡ **성능 최적화**
- **Back Pressure 처리**: throttle, debounce, sample 활용
- **Stream 조합**: merge, zip, combineLatest 성능 비교
- **Scheduler 최적화**: 작업 분산과 UI 반응성
- **Observable 생명주기**: share(), replay() 적절한 활용

## 🛠️ 사용 시나리오

### **네트워크 + RxSwift**
```swift
// ✅ 올바른 RxSwift 네트워크 패턴
protocol NetworkServiceInterface {
    func fetchData<T: Decodable>(endpoint: APIEndpoint, type: T.Type) -> Observable<T>
}

final class NetworkService: NetworkServiceInterface {
    private let session = URLSession.shared
    
    func fetchData<T: Decodable>(endpoint: APIEndpoint, type: T.Type) -> Observable<T> {
        return Observable.create { observer in
            let task = self.session.dataTask(with: endpoint.request) { data, response, error in
                if let error = error {
                    observer.onError(error)
                    return
                }
                
                guard let data = data else {
                    observer.onError(NetworkError.noData)
                    return
                }
                
                do {
                    let decoded = try JSONDecoder().decode(T.self, from: data)
                    observer.onNext(decoded)
                    observer.onCompleted()
                } catch {
                    observer.onError(error)
                }
            }
            
            task.resume()
            
            return Disposables.create {
                task.cancel()
            }
        }
        .observe(on: MainScheduler.instance)
    }
}
```

### **MVVM + Input/Output 패턴**
```swift
// ✅ RxSwift MVVM 베스트 프랙티스
final class UserViewModel {
    struct Input {
        let fetchTrigger: Observable<Void>
        let refreshTrigger: Observable<Void>
        let searchText: Observable<String>
    }
    
    struct Output {
        let users: Driver<[User]>
        let isLoading: Driver<Bool>
        let error: Driver<String?>
    }
    
    private let disposeBag = DisposeBag()
    private let userService: UserServiceInterface
    
    init(userService: UserServiceInterface) {
        self.userService = userService
    }
    
    func transform(input: Input) -> Output {
        let activityIndicator = ActivityIndicator()
        let errorTracker = ErrorTracker()
        
        let searchResults = input.searchText
            .debounce(.milliseconds(300), scheduler: MainScheduler.instance)
            .distinctUntilChanged()
            .flatMapLatest { [weak self] query -> Observable<[User]> in
                guard let self = self, !query.isEmpty else {
                    return .just([])
                }
                
                return self.userService.searchUsers(query: query)
                    .trackActivity(activityIndicator)
                    .trackError(errorTracker)
                    .catch { _ in .just([]) }
            }
        
        let users = Observable.merge(
            input.fetchTrigger.flatMapLatest { [weak self] _ -> Observable<[User]> in
                guard let self = self else { return .empty() }
                return self.userService.fetchUsers()
                    .trackActivity(activityIndicator)
                    .trackError(errorTracker)
                    .catch { _ in .just([]) }
            },
            searchResults
        )
        .asDriver(onErrorJustReturn: [])
        
        return Output(
            users: users,
            isLoading: activityIndicator.asDriver(),
            error: errorTracker.asDriver()
        )
    }
}
```

### **Coordinator + RxSwift 네비게이션**
```swift
// ✅ RxSwift 기반 Coordinator 패턴
protocol CoordinatorType: AnyObject {
    var childCoordinators: [CoordinatorType] { get set }
    var navigationController: UINavigationController { get set }
    
    func start() -> Observable<Void>
    func coordinate(to coordinator: CoordinatorType) -> Observable<Void>
}

final class UserCoordinator: CoordinatorType {
    var childCoordinators: [CoordinatorType] = []
    var navigationController: UINavigationController
    
    private let disposeBag = DisposeBag()
    
    init(navigationController: UINavigationController) {
        self.navigationController = navigationController
    }
    
    func start() -> Observable<Void> {
        let userService = UserService()
        let viewModel = UserViewModel(userService: userService)
        let viewController = UserViewController(viewModel: viewModel)
        
        navigationController.pushViewController(viewController, animated: true)
        
        return viewController.rx.userSelected
            .flatMap { [weak self] user -> Observable<Void> in
                guard let self = self else { return .empty() }
                return self.showUserDetail(user: user)
            }
    }
    
    private func showUserDetail(user: User) -> Observable<Void> {
        let coordinator = UserDetailCoordinator(
            navigationController: navigationController,
            user: user
        )
        
        return coordinate(to: coordinator)
    }
    
    func coordinate(to coordinator: CoordinatorType) -> Observable<Void> {
        childCoordinators.append(coordinator)
        
        return coordinator.start()
            .do(onNext: { [weak self] _ in
                self?.free(coordinator: coordinator)
            })
    }
    
    private func free(coordinator: CoordinatorType) {
        childCoordinators = childCoordinators.filter { $0 !== coordinator }
    }
}
```

## 🔍 메모리 누수 방지 패턴

### **DisposeBag 생명주기 관리**
```swift
// ✅ 올바른 DisposeBag 사용
final class UserViewController: UIViewController {
    private var disposeBag = DisposeBag()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        bindViewModel()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // 새로운 DisposeBag으로 재설정 (필요시)
        disposeBag = DisposeBag()
        bindViewModel()
    }
    
    private func bindViewModel() {
        // ✅ weak self 활용
        viewModel.output.users
            .drive(onNext: { [weak self] users in
                self?.updateUI(with: users)
            })
            .disposed(by: disposeBag)
        
        // ✅ 복잡한 클로저에서 capture list
        button.rx.tap
            .withLatestFrom(searchTextField.rx.text.orEmpty)
            .flatMapLatest { [weak viewModel] searchText -> Observable<[User]> in
                guard let viewModel = viewModel else { return .empty() }
                return viewModel.search(query: searchText)
            }
            .subscribe(onNext: { [weak self] users in
                self?.handleSearchResults(users)
            })
            .disposed(by: disposeBag)
    }
}
```

## 📊 성능 최적화 기법

### **Throttle vs Debounce vs Sample**
```swift
// 검색 텍스트 입력 - debounce 사용
searchTextField.rx.text.orEmpty
    .debounce(.milliseconds(300), scheduler: MainScheduler.instance)
    .distinctUntilChanged()

// 버튼 연속 탭 방지 - throttle 사용  
submitButton.rx.tap
    .throttle(.seconds(1), scheduler: MainScheduler.instance)

// 센서 데이터 샘플링 - sample 사용
accelerometerData
    .sample(Timer.publish(every: 0.1, on: .main, in: .common).autoconnect())
```

### **Share vs Replay 최적화**
```swift
// ✅ 네트워크 요청은 share() 사용
let networkRequest = networkService.fetchUsers()
    .share() // 여러 구독자가 같은 요청 공유

// ✅ 상태 관리는 replay(1) 사용
let currentUser = userRepository.getCurrentUser()
    .replay(1) // 최신 1개 값 유지
    .refCount()
```

## 🧪 RxTest 패턴

```swift
// ✅ RxTest를 활용한 ViewModel 테스트
final class UserViewModelTests: XCTestCase {
    private var scheduler: TestScheduler!
    private var disposeBag: DisposeBag!
    
    override func setUp() {
        super.setUp()
        scheduler = TestScheduler(initialClock: 0)
        disposeBag = DisposeBag()
    }
    
    func testUserSearch() {
        // Given
        let searchText = scheduler.createHotObservable([
            .next(10, "john"),
            .next(50, "jane"),
            .next(90, "")
        ])
        
        let fetchTrigger = scheduler.createHotObservable([
            .next(0, ())
        ])
        
        let mockService = MockUserService()
        let viewModel = UserViewModel(userService: mockService)
        
        // When
        let input = UserViewModel.Input(
            fetchTrigger: fetchTrigger.asObservable(),
            refreshTrigger: .empty(),
            searchText: searchText.asObservable()
        )
        
        let output = viewModel.transform(input: input)
        let result = scheduler.createObserver([User].self)
        
        output.users
            .drive(result)
            .disposed(by: disposeBag)
        
        scheduler.start()
        
        // Then
        let expected = [
            Recorded.next(310, mockService.johnUsers), // debounce 후
            Recorded.next(350, mockService.janeUsers),
            Recorded.next(390, [])
        ]
        
        XCTAssertEqual(result.events, expected)
    }
}
```

## 📚 지원하는 RxSwift 라이브러리

- **RxSwift**: 핵심 Reactive Extensions
- **RxCocoa**: UIKit/Cocoa 바인딩
- **RxTest**: 반응형 코드 테스팅
- **RxBlocking**: 동기적 테스트 헬퍼
- **Action**: 버튼/액션 관리
- **RxDataSources**: UITableView/UICollectionView 데이터 소스
- **RxGesture**: 제스처 바인딩
- **RxKeyboard**: 키보드 이벤트 관리

## 💡 베스트 프랙티스 체크리스트

### ✅ 메모리 관리
- [ ] 모든 Observable 구독에 DisposeBag 사용
- [ ] 클로저에서 weak self 활용
- [ ] ViewController deinit 시 DisposeBag 자동 해제 확인

### ✅ 성능 최적화
- [ ] UI 작업은 MainScheduler 사용
- [ ] 무거운 작업은 백그라운드 스케줄러 활용
- [ ] 적절한 연산자 선택 (throttle/debounce/sample)

### ✅ 에러 처리
- [ ] 네트워크 에러에 catch 연산자 활용
- [ ] 사용자 친화적 에러 메시지 제공
- [ ] 재시도 로직 구현 (retry/retryWhen)

### ✅ 테스트
- [ ] RxTest로 비동기 로직 테스트
- [ ] Mock을 활용한 의존성 주입
- [ ] Scheduler를 통한 시간 제어

**RxSwift로 더 나은 반응형 iOS 앱을 만들어보세요!** 🚀