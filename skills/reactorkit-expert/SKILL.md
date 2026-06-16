---
name: reactorkit-expert
description: "ReactorKit 전문가 - Flux 아키텍처, Reactor 패턴, Action-State-Mutation 플로우, View-Reactor 바인딩, RxSwift 통합, Pulse, Stub 테스팅, 상태 관리 최적화, 단방향 데이터 플로우 전문"
---

# ReactorKit 전문가 스킬

**Flux Architecture with ReactorKit** 전문 스킬로 iOS 앱에서 ReactorKit을 활용한 단방향 데이터 플로우를 최적화합니다.

## 🎯 핵심 전문 영역

### ⚡ **ReactorKit 기본 아키텍처**
- **Reactor 패턴**: Action → Mutation → State 단방향 플로우
- **View-Reactor 바인딩**: 명확한 Input/Output 분리
- **Pulse**: 상태 변화 감지와 일회성 이벤트 처리
- **Stub**: 테스트용 가짜 Reactor 구현

### 🏗️ **Flux Architecture 구현**
- **State 설계**: 불변성과 예측 가능한 상태 관리
- **Mutation**: 상태 변화 로직의 순수 함수화
- **Action**: 사용자 의도를 명확히 표현하는 액션 설계
- **Dependency Injection**: Reactor와 Service 계층 분리

### 🔄 **RxSwift 통합 최적화**
- **Observable Chain**: ReactorKit + RxSwift 연동 패턴
- **Scheduler 최적화**: UI와 비즈니스 로직 스케줄링
- **DisposeBag 관리**: Reactor 생명주기와 메모리 관리
- **Error Handling**: 에러 상태와 복구 플로우

### 📱 **View Layer 최적화**
- **View Protocol**: ReactorKit.View 구현 패턴
- **Binding**: bind(reactor:) 메서드 최적화
- **Pulse 활용**: 토스트, 알럿 등 일회성 이벤트 처리
- **State Mapping**: 복잡한 상태의 뷰 컴포넌트 매핑

## 🛠️ 사용 시나리오

### **기본 Reactor 구현 패턴**
```swift
import ReactorKit
import RxSwift

// ✅ ReactorKit 기본 패턴
final class UserListReactor: Reactor {
    enum Action {
        case refresh
        case loadMore
        case selectUser(User)
        case searchUser(String)
    }
    
    enum Mutation {
        case setLoading(Bool)
        case setUsers([User])
        case appendUsers([User])
        case setError(Error?)
        case setSelectedUser(User?)
        case setSearchQuery(String)
    }
    
    struct State {
        var isLoading: Bool = false
        var users: [User] = []
        var error: Error?
        var selectedUser: User?
        var searchQuery: String = ""
        
        // Pulse for one-time events
        var showToast: Pulse<String>?
        var shouldNavigate: Pulse<User>?
    }
    
    let initialState = State()
    
    // Dependencies
    private let userService: UserServiceInterface
    private let analytics: AnalyticsInterface
    
    init(
        userService: UserServiceInterface,
        analytics: AnalyticsInterface
    ) {
        self.userService = userService
        self.analytics = analytics
    }
    
    // MARK: - Mutations
    func mutate(action: Action) -> Observable<Mutation> {
        switch action {
        case .refresh:
            return Observable.concat([
                Observable.just(.setLoading(true)),
                userService.fetchUsers()
                    .asObservable()
                    .map { .setUsers($0) }
                    .catch { .just(.setError($0)) },
                Observable.just(.setLoading(false))
            ])
            
        case .loadMore:
            guard !currentState.isLoading else { return .empty() }
            let page = currentState.users.count / 20 + 1
            
            return Observable.concat([
                Observable.just(.setLoading(true)),
                userService.fetchUsers(page: page)
                    .asObservable()
                    .map { .appendUsers($0) }
                    .catch { .just(.setError($0)) },
                Observable.just(.setLoading(false))
            ])
            
        case .selectUser(let user):
            analytics.trackEvent("user_selected", parameters: ["userId": user.id])
            return Observable.concat([
                Observable.just(.setSelectedUser(user)),
                // Pulse로 네비게이션 트리거
                Observable.just(.setShouldNavigate(user))
            ])
            
        case .searchUser(let query):
            return Observable.concat([
                Observable.just(.setSearchQuery(query)),
                Observable.just(.setLoading(true)),
                userService.searchUsers(query: query)
                    .asObservable()
                    .map { .setUsers($0) }
                    .catch { error in
                        return Observable.concat([
                            Observable.just(.setError(error)),
                            Observable.just(.setShowToast("검색 중 오류가 발생했습니다"))
                        ])
                    },
                Observable.just(.setLoading(false))
            ])
        }
    }
    
    // MARK: - Reduce
    func reduce(state: State, mutation: Mutation) -> State {
        var newState = state
        
        switch mutation {
        case .setLoading(let isLoading):
            newState.isLoading = isLoading
            
        case .setUsers(let users):
            newState.users = users
            newState.error = nil
            
        case .appendUsers(let users):
            newState.users.append(contentsOf: users)
            
        case .setError(let error):
            newState.error = error
            
        case .setSelectedUser(let user):
            newState.selectedUser = user
            
        case .setSearchQuery(let query):
            newState.searchQuery = query
            
        case .setShowToast(let message):
            newState.showToast = Pulse(value: message)
            
        case .setShouldNavigate(let user):
            newState.shouldNavigate = Pulse(value: user)
        }
        
        return newState
    }
}

// MARK: - Mutation Extensions
extension UserListReactor.Mutation {
    static func setShowToast(_ message: String) -> UserListReactor.Mutation {
        return .setShowToast(message)
    }
    
    static func setShouldNavigate(_ user: User) -> UserListReactor.Mutation {
        return .setShouldNavigate(user)
    }
}
```

### **View-Reactor 바인딩 패턴**
```swift
import ReactorKit
import RxCocoa
import RxSwift

// ✅ ReactorKit.View 구현 패턴
final class UserListViewController: UIViewController, View {
    typealias Reactor = UserListReactor
    
    var disposeBag = DisposeBag()
    
    // MARK: - UI Components
    @IBOutlet private weak var tableView: UITableView!
    @IBOutlet private weak var searchTextField: UITextField!
    @IBOutlet private weak var refreshButton: UIButton!
    @IBOutlet private weak var activityIndicator: UIActivityIndicatorView!
    
    // MARK: - Properties
    private let dataSource = UserTableViewDataSource()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupTableView()
    }
    
    private func setupTableView() {
        tableView.dataSource = dataSource
        tableView.delegate = self
    }
    
    // MARK: - Binding
    func bind(reactor: UserListReactor) {
        bindAction(reactor)
        bindState(reactor)
    }
    
    private func bindAction(_ reactor: UserListReactor) {
        // View → Reactor (Actions)
        
        // Pull to refresh
        rx.viewDidLoad
            .map { Reactor.Action.refresh }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        // Refresh button
        refreshButton.rx.tap
            .map { Reactor.Action.refresh }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        // Search text input
        searchTextField.rx.text.orEmpty
            .debounce(.milliseconds(300), scheduler: MainScheduler.instance)
            .distinctUntilChanged()
            .map { Reactor.Action.searchUser($0) }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        // Table view selection
        tableView.rx.modelSelected(User.self)
            .map { Reactor.Action.selectUser($0) }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        // Load more (pagination)
        tableView.rx.reachedBottom
            .map { Reactor.Action.loadMore }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
    }
    
    private func bindState(_ reactor: UserListReactor) {
        // Reactor → View (State)
        
        // Loading indicator
        reactor.state.map { $0.isLoading }
            .distinctUntilChanged()
            .bind(to: activityIndicator.rx.isAnimating)
            .disposed(by: disposeBag)
        
        // User list
        reactor.state.map { $0.users }
            .distinctUntilChanged()
            .bind(to: tableView.rx.items(dataSource: dataSource))
            .disposed(by: disposeBag)
        
        // Error handling
        reactor.state.compactMap { $0.error }
            .observe(on: MainScheduler.instance)
            .subscribe(onNext: { [weak self] error in
                self?.showErrorAlert(error: error)
            })
            .disposed(by: disposeBag)
        
        // Pulse: Toast message
        reactor.pulse(\.$showToast)
            .compactMap { $0 }
            .observe(on: MainScheduler.instance)
            .subscribe(onNext: { [weak self] message in
                self?.showToast(message: message)
            })
            .disposed(by: disposeBag)
        
        // Pulse: Navigation
        reactor.pulse(\.$shouldNavigate)
            .compactMap { $0 }
            .observe(on: MainScheduler.instance)
            .subscribe(onNext: { [weak self] user in
                self?.navigateToUserDetail(user: user)
            })
            .disposed(by: disposeBag)
    }
    
    // MARK: - Helper Methods
    private func showErrorAlert(error: Error) {
        let alert = UIAlertController(
            title: "오류",
            message: error.localizedDescription,
            preferredStyle: .alert
        )
        alert.addAction(UIAlertAction(title: "확인", style: .default))
        present(alert, animated: true)
    }
    
    private func showToast(message: String) {
        // Toast 구현
    }
    
    private func navigateToUserDetail(user: User) {
        let detailVC = UserDetailViewController()
        detailVC.reactor = UserDetailReactor(user: user)
        navigationController?.pushViewController(detailVC, animated: true)
    }
}

// MARK: - UITableViewDelegate
extension UserListViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 80
    }
}

// MARK: - Rx Extensions
extension Reactive where Base: UITableView {
    var reachedBottom: Observable<Void> {
        return contentOffset
            .flatMap { [weak base] contentOffset -> Observable<Void> in
                guard let tableView = base else { return .empty() }
                
                let visibleHeight = tableView.frame.height - tableView.contentInset.top - tableView.contentInset.bottom
                let y = contentOffset.y + tableView.contentInset.top
                let threshold = max(0.0, tableView.contentSize.height - visibleHeight)
                
                return y > threshold ? .just(()) : .empty()
            }
            .debounce(.milliseconds(200), scheduler: MainScheduler.instance)
    }
}
```

### **Child Reactor 패턴**
```swift
// ✅ 복합 Reactor 구성
final class UserProfileReactor: Reactor {
    enum Action {
        case updateProfile(UserProfile)
        case uploadPhoto(UIImage)
        case deleteAccount
    }
    
    enum Mutation {
        case setLoading(Bool)
        case setProfile(UserProfile)
        case setPhotoUploadProgress(Double)
        case showDeleteConfirmation
    }
    
    struct State {
        var isLoading: Bool = false
        var profile: UserProfile?
        var photoUploadProgress: Double = 0.0
        var showDeleteAlert: Pulse<Void>?
    }
    
    let initialState = State()
    
    // Child Reactors
    let photoReactor: PhotoUploadReactor
    let settingsReactor: SettingsReactor
    
    init(
        user: User,
        userService: UserServiceInterface,
        photoService: PhotoServiceInterface
    ) {
        self.photoReactor = PhotoUploadReactor(photoService: photoService)
        self.settingsReactor = SettingsReactor(userService: userService)
    }
    
    func mutate(action: Action) -> Observable<Mutation> {
        switch action {
        case .updateProfile(let profile):
            return updateProfile(profile)
            
        case .uploadPhoto(let image):
            return photoReactor.action.onNext(.upload(image))
                .flatMap { self.photoReactor.state.map { $0.progress } }
                .map { .setPhotoUploadProgress($0) }
            
        case .deleteAccount:
            return .just(.showDeleteConfirmation)
        }
    }
    
    func reduce(state: State, mutation: Mutation) -> State {
        var newState = state
        
        switch mutation {
        case .setLoading(let isLoading):
            newState.isLoading = isLoading
        case .setProfile(let profile):
            newState.profile = profile
        case .setPhotoUploadProgress(let progress):
            newState.photoUploadProgress = progress
        case .showDeleteConfirmation:
            newState.showDeleteAlert = Pulse(value: ())
        }
        
        return newState
    }
}
```

## 🧪 ReactorKit 테스팅 패턴

### **Reactor Stub 활용**
```swift
// ✅ 테스트용 Stub Reactor
final class UserListReactorStub: UserListReactor {
    override func mutate(action: Action) -> Observable<Mutation> {
        switch action {
        case .refresh:
            return .just(.setUsers([User.mock1, User.mock2]))
            
        case .searchUser(let query):
            if query == "john" {
                return .just(.setUsers([User.johnMock]))
            } else {
                return .just(.setUsers([]))
            }
            
        default:
            return super.mutate(action: action)
        }
    }
}

// ✅ UI 테스트에서 Stub 활용
final class UserListViewControllerTests: XCTestCase {
    private var viewController: UserListViewController!
    private var reactor: UserListReactorStub!
    
    override func setUp() {
        super.setUp()
        reactor = UserListReactorStub()
        viewController = UserListViewController()
        viewController.reactor = reactor
        
        _ = viewController.view // viewDidLoad 트리거
    }
    
    func testSearchUser() {
        // When
        viewController.searchTextField.text = "john"
        viewController.searchTextField.sendActions(for: .editingChanged)
        
        // Wait for debounce
        let expectation = XCTestExpectation()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            expectation.fulfill()
        }
        wait(for: [expectation], timeout: 1.0)
        
        // Then
        XCTAssertEqual(viewController.tableView.numberOfRows(inSection: 0), 1)
    }
}
```

### **State 테스트 패턴**
```swift
// ✅ Reactor 단위 테스트
final class UserListReactorTests: XCTestCase {
    private var reactor: UserListReactor!
    private var mockUserService: MockUserService!
    
    override func setUp() {
        super.setUp()
        mockUserService = MockUserService()
        reactor = UserListReactor(userService: mockUserService)
    }
    
    func testRefreshUsers() {
        // Given
        let users = [User.mock1, User.mock2]
        mockUserService.fetchUsersResult = .success(users)
        
        // When
        reactor.action.onNext(.refresh)
        
        // Then
        XCTAssertEqual(reactor.currentState.users, users)
        XCTAssertFalse(reactor.currentState.isLoading)
        XCTAssertNil(reactor.currentState.error)
    }
    
    func testRefreshUsersError() {
        // Given
        let error = NetworkError.serverError
        mockUserService.fetchUsersResult = .failure(error)
        
        // When
        reactor.action.onNext(.refresh)
        
        // Then
        XCTAssertTrue(reactor.currentState.users.isEmpty)
        XCTAssertFalse(reactor.currentState.isLoading)
        XCTAssertNotNil(reactor.currentState.error)
    }
    
    func testPulseEvent() {
        // Given
        let user = User.mock1
        
        // When
        reactor.action.onNext(.selectUser(user))
        
        // Then
        XCTAssertNotNil(reactor.currentState.shouldNavigate)
        XCTAssertEqual(reactor.currentState.shouldNavigate?.value, user)
        
        // Pulse는 한 번만 발생
        XCTAssertNil(reactor.currentState.shouldNavigate)
    }
}
```

## 💡 베스트 프랙티스

### ✅ Reactor 설계
- [ ] Action은 사용자 의도를 명확히 표현
- [ ] Mutation은 순수 함수로 상태 변화 표현
- [ ] State는 불변성 유지 (struct 사용)
- [ ] Pulse로 일회성 이벤트 처리

### ✅ View 바인딩
- [ ] bind(reactor:)에서 모든 바인딩 처리
- [ ] Action과 State 바인딩 메서드 분리
- [ ] DisposeBag 올바른 생명주기 관리
- [ ] MainScheduler에서 UI 업데이트

### ✅ 테스팅
- [ ] Stub Reactor로 UI 테스트 격리
- [ ] Mock Service로 비즈니스 로직 테스트
- [ ] Pulse 이벤트 테스트 포함
- [ ] State 변화 시나리오 검증

### ✅ 성능 최적화
- [ ] 불필요한 상태 변화 최소화
- [ ] 복잡한 연산은 백그라운드 스케줄러 활용
- [ ] 메모리 누수 방지 (weak reference)
- [ ] Child Reactor로 관심사 분리

**ReactorKit으로 예측 가능하고 테스트 가능한 iOS 앱을 만들어보세요!** ⚛️