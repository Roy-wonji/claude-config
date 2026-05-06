# Point-Free TCA Performance Patterns

## Reducer Composition Best Practices

### 1. Effect Cancellation Patterns

```swift
@Reducer
struct AppReducer {
  enum CancelID: Hashable {
    case api
    case timer
    case location
    
    // Hierarchical cancellation
    case featureA
    case featureAChild
  }
  
  var body: some ReducerOf<Self> {
    Reduce { state, action in
      switch action {
      case .cancelAllEffects:
        return .merge(
          .cancel(id: CancelID.api),
          .cancel(id: CancelID.timer),
          .cancel(id: CancelID.location)
        )
      }
    }
  }
}
```

### 2. State Normalization for Performance

```swift
// ❌ Poor Performance: Linear search O(n)
@ObservableState
struct BadState {
  var users: [User] = []
  
  func user(with id: User.ID) -> User? {
    users.first { $0.id == id } // O(n) lookup
  }
}

// ✅ Good Performance: Hash lookup O(1) 
@ObservableState  
struct GoodState {
  var users: IdentifiedArrayOf<User> = []
  
  func user(with id: User.ID) -> User? {
    users[id: id] // O(1) lookup
  }
}
```

### 3. Memory-Efficient Store Scoping

```swift
// ❌ Memory leak: Store retains entire parent state
struct BadChildView: View {
  let store: StoreOf<ParentFeature> // Retains all parent state
  
  var body: some View {
    let childStore = store.scope(state: \.child, action: \.child)
    ChildView(store: childStore)
  }
}

// ✅ Memory efficient: Pre-scoped store
struct GoodChildView: View {
  let store: StoreOf<ChildFeature> // Only child state
  
  var body: some View {
    ChildView(store: store)
  }
}

// Parent passes pre-scoped store
struct ParentView: View {
  let store: StoreOf<ParentFeature>
  
  var body: some View {
    GoodChildView(
      store: store.scope(state: \.child, action: \.child)
    )
  }
}
```

### 4. Efficient Navigation Patterns

```swift
@Reducer
struct NavigationFeature {
  @ObservableState
  struct State {
    // Use StackState for memory efficiency
    var path: StackState<Destination.State> = []
  }
  
  @Reducer(state: .equatable)
  enum Destination {
    case detail(DetailFeature)
    case settings(SettingsFeature)
  }
  
  var body: some ReducerOf<Self> {
    Reduce { state, action in
      switch action {
      case .path(.element(_, .detail(.delegate(.dismiss)))):
        // Remove from stack when dismissed
        state.path.removeLast()
        return .none
      }
    }
    .forEach(\.path, action: \.path) {
      Destination.body
    }
  }
}
```

### 5. Effect Lifecycle Management

```swift
@Reducer
struct DataFeature {
  @ObservableState
  struct State {
    var data: [Item] = []
    var isLoading = false
  }
  
  enum Action {
    case onAppear
    case onDisappear  
    case loadData
    case dataLoaded([Item])
  }
  
  enum CancelID { case loadData }
  
  var body: some ReducerOf<Self> {
    Reduce { state, action in
      switch action {
      case .onAppear:
        return .send(.loadData)
        
      case .onDisappear:
        // Cancel effects when view disappears
        return .cancel(id: CancelID.loadData)
        
      case .loadData:
        state.isLoading = true
        return .run { send in
          let data = try await apiClient.loadData()
          await send(.dataLoaded(data))
        }
        .cancellable(id: CancelID.loadData, cancelInFlight: true)
        
      case .dataLoaded(let data):
        state.data = data
        state.isLoading = false
        return .none
      }
    }
  }
}
```

## Performance Anti-Patterns to Avoid

### 1. Excessive State Observation

```swift
// ❌ Bad: Multiple store subscriptions
struct BadView: View {
  @Bindable var store: StoreOf<Feature>
  
  var body: some View {
    VStack {
      if store.isLoading { // Subscription 1
        ProgressView()
      }
      
      ForEach(store.items) { item in // Subscription 2
        Text(item.name)
      }
      
      Text(store.errorMessage ?? "") // Subscription 3
    }
  }
}

// ✅ Good: Single store observation
struct GoodView: View {
  let store: StoreOf<Feature>
  
  var body: some View {
    let isLoading = store.isLoading
    let items = store.items  
    let errorMessage = store.errorMessage
    
    VStack {
      if isLoading {
        ProgressView()
      }
      
      ForEach(items) { item in
        Text(item.name)
      }
      
      Text(errorMessage ?? "")
    }
  }
}
```

### 2. Unnecessary Effect Creation

```swift
// ❌ Bad: Creates new effect on every action
return .run { send in
  // This runs every time, even if not needed
  await expensiveOperation()
}

// ✅ Good: Conditional effect creation
guard shouldPerformOperation else {
  return .none
}

return .run { send in
  await expensiveOperation()
}
.cancellable(id: CancelID.operation, cancelInFlight: true)
```

### 3. Memory Leaks in Effects

```swift
// ❌ Bad: Potential retain cycle
return .run { [store] send in
  // store is captured strongly
  await store.doSomething()
}

// ✅ Good: Weak capture
return .run { [weak store] send in
  guard let store = store else { return }
  await store.doSomething()
}

// ✅ Better: Use dependency
@Dependency(\.apiClient) var apiClient

return .run { send in
  await apiClient.doSomething()
}
```

## Performance Testing with TCA

```swift
func testPerformance() {
  let store = TestStore(initialState: Feature.State()) {
    Feature()
  }
  
  // Test large state updates
  measure {
    store.send(.loadLargeDataSet(Array(1...10000)))
  }
  
  // Test effect cancellation speed
  store.send(.startLongRunningOperation)
  measure {
    store.send(.cancelOperation)
  }
}
```