/**
 * Clean Architecture Specialist Agent
 *
 * Expert in Clean Architecture principles for iOS applications including:
 * - Domain-Driven Design (DDD) patterns
 * - SOLID principles implementation
 * - Layer separation and dependency inversion
 * - Use Cases and Business Logic organization
 * - Repository and Gateway patterns
 * - Entity and Value Object design
 * - Architectural boundaries and abstraction
 */

export interface ArchitectureIssue {
  type: 'layering' | 'dependency' | 'solid' | 'ddd' | 'separation' | 'abstraction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
  codeExample?: string;
  principle?: string; // Which architectural principle is violated
}

export class CleanArchitectureAgent {
  /**
   * Clean Architecture layers for iOS applications
   */
  static readonly ARCHITECTURE_LAYERS = {
    presentation: {
      description: "UI layer containing Views, ViewModels, and UI-specific logic",
      patterns: ['View', 'ViewController', 'ViewModel', 'Presenter', 'Router'],
      responsibilities: [
        "User interface rendering",
        "User input handling",
        "Navigation logic",
        "UI state management"
      ]
    },

    application: {
      description: "Use Cases and Application Services layer",
      patterns: ['UseCase', 'ApplicationService', 'Command', 'Query'],
      responsibilities: [
        "Business workflow orchestration",
        "Use case implementation",
        "Application-specific business rules",
        "Cross-cutting concerns coordination"
      ]
    },

    domain: {
      description: "Core business logic and entities",
      patterns: ['Entity', 'ValueObject', 'DomainService', 'Repository', 'Aggregate'],
      responsibilities: [
        "Business entities and value objects",
        "Domain business rules",
        "Domain events",
        "Business invariants"
      ]
    },

    infrastructure: {
      description: "External concerns like networking, persistence, and frameworks",
      patterns: ['Repository', 'Gateway', 'Adapter', 'Infrastructure'],
      responsibilities: [
        "Data persistence implementation",
        "External API communication",
        "Framework integrations",
        "Cross-cutting infrastructure concerns"
      ]
    }
  };

  /**
   * SOLID principles for iOS development
   */
  static readonly SOLID_PRINCIPLES = {
    singleResponsibility: {
      name: "Single Responsibility Principle (SRP)",
      description: "A class should have only one reason to change",
      violations: [
        "ViewControllers doing networking and UI logic",
        "Models containing persistence and business logic",
        "Services handling multiple unrelated concerns"
      ],
      fixes: [
        "Separate networking into dedicated services",
        "Extract business logic into domain services",
        "Split large services into focused components"
      ]
    },

    openClosed: {
      name: "Open-Closed Principle (OCP)",
      description: "Software entities should be open for extension but closed for modification",
      violations: [
        "Switch statements for type checking",
        "Hard-coded dependencies",
        "Direct instantiation of concrete types"
      ],
      fixes: [
        "Use protocols and polymorphism",
        "Implement Strategy pattern",
        "Use dependency injection"
      ]
    },

    liskovSubstitution: {
      name: "Liskov Substitution Principle (LSP)",
      description: "Objects of a superclass should be replaceable with objects of its subclasses",
      violations: [
        "Subclasses throwing unexpected errors",
        "Strengthened preconditions in subclasses",
        "Weakened postconditions in subclasses"
      ],
      fixes: [
        "Ensure consistent behavior in implementations",
        "Use protocols instead of inheritance where appropriate",
        "Follow contract specifications in implementations"
      ]
    },

    interfaceSegregation: {
      name: "Interface Segregation Principle (ISP)",
      description: "Clients should not be forced to depend on methods they do not use",
      violations: [
        "Fat protocols with too many methods",
        "ViewControllers implementing unused delegate methods",
        "Services with unrelated method groups"
      ],
      fixes: [
        "Split large protocols into focused ones",
        "Use protocol composition",
        "Create role-specific interfaces"
      ]
    },

    dependencyInversion: {
      name: "Dependency Inversion Principle (DIP)",
      description: "Depend on abstractions, not concretions",
      violations: [
        "Direct instantiation of concrete classes",
        "Importing specific implementations",
        "Hard-coded external dependencies"
      ],
      fixes: [
        "Inject dependencies through initializers",
        "Use protocols for abstraction",
        "Implement dependency injection container"
      ]
    }
  };

  /**
   * Domain-Driven Design patterns for iOS
   */
  static readonly DDD_PATTERNS = {
    entity: {
      description: "Objects with identity and lifecycle",
      characteristics: [
        "Has unique identifier",
        "Mutable state",
        "Business logic methods",
        "Encapsulated invariants"
      ],
      example: `
struct User: Entity {
    let id: UserID
    private(set) var profile: UserProfile
    private(set) var preferences: UserPreferences

    func updateProfile(_ newProfile: UserProfile) throws {
        guard newProfile.isValid else {
            throw UserError.invalidProfile
        }
        profile = newProfile
    }
}
      `
    },

    valueObject: {
      description: "Immutable objects defined by their attributes",
      characteristics: [
        "Immutable",
        "Equality based on attributes",
        "No identity",
        "Side-effect free methods"
      ],
      example: `
struct Money: ValueObject, Equatable {
    let amount: Decimal
    let currency: Currency

    func add(_ other: Money) throws -> Money {
        guard currency == other.currency else {
            throw MoneyError.currencyMismatch
        }
        return Money(amount: amount + other.amount, currency: currency)
    }
}
      `
    },

    aggregate: {
      description: "Cluster of entities and value objects with consistency boundary",
      characteristics: [
        "Has aggregate root",
        "Maintains consistency",
        "Controls access to internals",
        "Publishes domain events"
      ],
      example: `
class OrderAggregate {
    private let order: Order
    private var items: [OrderItem]

    func addItem(_ product: Product, quantity: Int) throws {
        guard quantity > 0 else {
            throw OrderError.invalidQuantity
        }

        let item = OrderItem(product: product, quantity: quantity)
        items.append(item)

        // Publish domain event
        DomainEvents.publish(ItemAddedToOrder(orderId: order.id, item: item))
    }
}
      `
    },

    repository: {
      description: "Abstracts data access for aggregates",
      characteristics: [
        "Collection-like interface",
        "Aggregate-oriented",
        "Domain-focused queries",
        "Persistence ignorant"
      ],
      example: `
protocol UserRepository {
    func find(by id: UserID) async throws -> User?
    func findByEmail(_ email: Email) async throws -> User?
    func save(_ user: User) async throws
    func remove(_ user: User) async throws
}
      `
    },

    domainService: {
      description: "Stateless services for domain logic that doesn't belong to entities",
      characteristics: [
        "Stateless operations",
        "Domain logic focus",
        "Coordinates between entities",
        "No business state"
      ],
      example: `
struct TransferService: DomainService {
    func transfer(
        amount: Money,
        from sourceAccount: Account,
        to destinationAccount: Account
    ) throws {
        try sourceAccount.withdraw(amount)
        try destinationAccount.deposit(amount)

        DomainEvents.publish(MoneyTransferred(
            amount: amount,
            from: sourceAccount.id,
            to: destinationAccount.id
        ))
    }
}
      `
    }
  };

  /**
   * Architecture violation patterns to detect
   */
  static readonly ARCHITECTURE_VIOLATIONS = [
    {
      pattern: /import UIKit.*\n.*struct.*Repository/g,
      type: 'layering' as const,
      description: "Domain layer importing UI framework",
      fix: "Remove UIKit import from domain/infrastructure layer"
    },
    {
      pattern: /class.*ViewController.*\{[\s\S]*URLSession/g,
      type: 'separation' as const,
      description: "ViewController handling networking directly",
      fix: "Extract networking logic into dedicated service"
    },
    {
      pattern: /struct.*Entity.*\{[\s\S]*CoreData/g,
      type: 'dependency' as const,
      description: "Domain entity depending on persistence framework",
      fix: "Use repository pattern to abstract persistence"
    },
    {
      pattern: /protocol.*\{[\s\S]*func.*\n[\s\S]*func.*\n[\s\S]*func.*\n[\s\S]*func.*\n[\s\S]*func/g,
      type: 'solid' as const,
      description: "Interface with too many methods (ISP violation)",
      fix: "Split protocol into focused, cohesive interfaces"
    }
  ];

  /**
   * Generate Clean Architecture analysis prompt
   */
  static generateArchitectureAnalysisPrompt(projectPath: string): string {
    return `
# Clean Architecture Analysis for iOS Project: ${projectPath}

## Analysis Focus Areas

### 1. Layer Separation Analysis
Evaluate the current layering and identify violations:

**Expected Layer Structure:**
- **Presentation Layer**: Views, ViewControllers, ViewModels, Presenters
- **Application Layer**: Use Cases, Application Services, DTOs
- **Domain Layer**: Entities, Value Objects, Domain Services, Repository Protocols
- **Infrastructure Layer**: Repository Implementations, Network Services, Persistence

**Check for:**
- Cross-layer dependencies (domain importing UI frameworks)
- Circular dependencies between layers
- Business logic in presentation layer
- UI logic in domain layer

### 2. SOLID Principles Compliance

**Single Responsibility Principle:**
- [ ] Classes have single reason to change
- [ ] ViewControllers only handle UI orchestration
- [ ] Services have focused responsibilities

**Open-Closed Principle:**
- [ ] Code open for extension, closed for modification
- [ ] Use of protocols and polymorphism
- [ ] Strategy pattern implementation

**Liskov Substitution Principle:**
- [ ] Subtypes are substitutable for base types
- [ ] Consistent behavior in implementations
- [ ] Proper protocol conformance

**Interface Segregation Principle:**
- [ ] Protocols are focused and cohesive
- [ ] No forced dependency on unused methods
- [ ] Role-specific interfaces

**Dependency Inversion Principle:**
- [ ] Depend on abstractions, not concretions
- [ ] Dependency injection usage
- [ ] Protocol-based architecture

### 3. Domain-Driven Design Patterns

**Domain Model:**
- [ ] Rich domain entities with behavior
- [ ] Immutable value objects
- [ ] Aggregate boundaries and roots
- [ ] Domain events for decoupling

**Repository Pattern:**
- [ ] Collection-like interface
- [ ] Aggregate-oriented queries
- [ ] Abstraction of persistence concerns
- [ ] Domain-focused method names

**Use Cases/Application Services:**
- [ ] Clear business workflow orchestration
- [ ] Coordination between domain objects
- [ ] Transaction boundaries
- [ ] Cross-cutting concerns handling

### 4. Architectural Boundaries

**Dependency Rules:**
- Source code dependencies point inward only
- Inner circles don't know about outer circles
- Data crossing boundaries is simple data structures

**Boundary Crossings:**
- DTOs for data transfer
- Protocols for abstraction
- Dependency injection for control flow

## Architecture Assessment Checklist

### Domain Layer Purity
- [ ] No framework dependencies
- [ ] Rich business logic
- [ ] Encapsulated invariants
- [ ] Domain events

### Application Layer Organization
- [ ] Use case implementation
- [ ] Infrastructure coordination
- [ ] Transaction management
- [ ] Security concerns

### Presentation Layer Separation
- [ ] UI logic only
- [ ] No business rules
- [ ] Thin controllers/presenters
- [ ] View state management

### Infrastructure Layer Implementation
- [ ] Framework integrations
- [ ] External service adapters
- [ ] Persistence implementations
- [ ] Cross-cutting concerns

Provide specific recommendations for improving architectural quality with code examples.
    `;
  }

  /**
   * Generate architecture improvement recommendations
   */
  static generateImprovementPlan(issues: ArchitectureIssue[]): string {
    const layeringIssues = issues.filter(issue => issue.type === 'layering');
    const solidIssues = issues.filter(issue => issue.type === 'solid');
    const dddIssues = issues.filter(issue => issue.type === 'ddd');
    const dependencyIssues = issues.filter(issue => issue.type === 'dependency');

    return `
# 🏗️ Clean Architecture Improvement Plan

## 📊 Architecture Health Summary
- **Layering Issues:** ${layeringIssues.length}
- **SOLID Violations:** ${solidIssues.length}
- **DDD Pattern Issues:** ${dddIssues.length}
- **Dependency Issues:** ${dependencyIssues.length}

## 🎯 Priority Improvements

### 1. Layer Separation (Critical)
${layeringIssues.length > 0 ? `
${layeringIssues.map((issue, index) => `
#### ${index + 1}. ${issue.file}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}

${issue.codeExample ? `
\`\`\`swift
${issue.codeExample}
\`\`\`
` : ''}
`).join('')}
` : '✅ No critical layering issues found'}

### 2. SOLID Principles
${solidIssues.length > 0 ? `
${solidIssues.map((issue, index) => `
#### ${index + 1}. ${issue.principle} Violation
**File:** ${issue.file}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}
`).join('')}
` : '✅ SOLID principles well-implemented'}

### 3. Domain-Driven Design
${dddIssues.length > 0 ? `
${dddIssues.map((issue, index) => `
#### ${index + 1}. DDD Pattern Issue
**File:** ${issue.file}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}
`).join('')}
` : '✅ Good DDD pattern implementation'}

### 4. Dependency Management
${dependencyIssues.length > 0 ? `
${dependencyIssues.map((issue, index) => `
#### ${index + 1}. Dependency Issue
**File:** ${issue.file}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}
`).join('')}
` : '✅ Clean dependency structure'}

## 🛠️ Implementation Roadmap

### Phase 1: Layer Separation (Week 1-2)
1. **Extract Business Logic**
   - Move business rules from ViewControllers to Use Cases
   - Create Domain Services for complex business operations
   - Implement Repository protocols in Domain layer

2. **Clean Dependencies**
   - Remove framework imports from Domain layer
   - Use Dependency Injection for Infrastructure components
   - Implement proper abstraction layers

### Phase 2: SOLID Compliance (Week 3-4)
1. **Single Responsibility**
   - Split fat ViewControllers into focused components
   - Extract services with single concerns
   - Separate data models from business logic

2. **Dependency Inversion**
   - Create protocols for all external dependencies
   - Implement dependency injection container
   - Use protocol composition for complex dependencies

### Phase 3: DDD Enhancement (Week 5-6)
1. **Rich Domain Model**
   - Convert anemic models to rich entities
   - Implement value objects for business concepts
   - Create aggregate roots with proper boundaries

2. **Repository Pattern**
   - Implement collection-like repositories
   - Create aggregate-oriented queries
   - Add domain events for decoupling

### Phase 4: Testing & Validation (Week 7-8)
1. **Architecture Tests**
   - Implement layer dependency tests
   - Create SOLID principle validation
   - Add integration tests for boundaries

2. **Documentation**
   - Create architecture decision records (ADRs)
   - Document domain model and ubiquitous language
   - Maintain architectural guidelines

## 📐 Architectural Patterns to Implement

### Clean Architecture Structure
\`\`\`
iOS App/
├── Presentation/           # UI Layer
│   ├── Views/
│   ├── ViewModels/
│   └── Presenters/
├── Application/           # Use Cases
│   ├── UseCases/
│   ├── Services/
│   └── DTOs/
├── Domain/               # Business Logic
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Services/
│   └── Repositories/     # Protocols only
└── Infrastructure/       # External Concerns
    ├── Repositories/     # Implementations
    ├── Network/
    └── Persistence/
\`\`\`

### Dependency Injection Example
\`\`\`swift
// Domain Layer - Protocol
protocol UserRepository {
    func save(_ user: User) async throws
    func findById(_ id: UserID) async throws -> User?
}

// Application Layer - Use Case
struct CreateUserUseCase {
    private let userRepository: UserRepository
    private let emailValidator: EmailValidator

    init(userRepository: UserRepository, emailValidator: EmailValidator) {
        self.userRepository = userRepository
        self.emailValidator = emailValidator
    }

    func execute(_ request: CreateUserRequest) async throws -> User {
        guard emailValidator.isValid(request.email) else {
            throw UserError.invalidEmail
        }

        let user = User(email: request.email, name: request.name)
        try await userRepository.save(user)
        return user
    }
}

// Infrastructure Layer - Implementation
final class CoreDataUserRepository: UserRepository {
    // Implementation details...
}
\`\`\`

## 🎯 Success Metrics

### Code Quality Metrics
- [ ] Dependency direction compliance (100%)
- [ ] Single Responsibility adherence (>90%)
- [ ] Interface Segregation compliance (>95%)
- [ ] Testability improvement (>80% coverage)

### Architecture Metrics
- [ ] Layer coupling reduction
- [ ] Cyclomatic complexity decrease
- [ ] Business logic concentration in Domain
- [ ] Infrastructure abstraction level

## 📚 Recommended Reading

### Clean Architecture Resources
- "Clean Architecture" by Robert C. Martin
- "Domain-Driven Design" by Eric Evans
- "Implementing Domain-Driven Design" by Vaughn Vernon

### iOS-Specific Patterns
- "Advanced iOS App Architecture" by raywenderlich.com
- "iOS Architecture Patterns" by objc.io
- "Clean Swift Architecture" guidelines

Start with Phase 1 (Layer Separation) as it provides the foundation for all other improvements.
    `;
  }

  /**
   * Code examples for common architectural patterns
   */
  static readonly ARCHITECTURE_EXAMPLES = {
    cleanEntity: `
// Clean Architecture Entity Example
struct User: Entity {
    let id: UserID
    private(set) var profile: UserProfile
    private(set) var accountStatus: AccountStatus

    // Business logic encapsulated in entity
    func suspend(reason: SuspensionReason, by administrator: UserID) throws -> DomainEvent {
        guard accountStatus.canBeSuspended else {
            throw UserError.cannotSuspendAccount
        }

        accountStatus = .suspended(reason: reason, by: administrator, at: Date())

        return UserSuspended(
            userId: id,
            reason: reason,
            suspendedBy: administrator,
            suspendedAt: Date()
        )
    }

    func updateProfile(_ newProfile: UserProfile) throws {
        guard newProfile.isValid else {
            throw UserError.invalidProfile
        }

        profile = newProfile
    }
}
    `,

    useCase: `
// Use Case with Dependency Injection
struct AuthenticateUserUseCase {
    private let userRepository: UserRepository
    private let passwordService: PasswordService
    private let tokenService: TokenService
    private let auditLogger: AuditLogger

    init(
        userRepository: UserRepository,
        passwordService: PasswordService,
        tokenService: TokenService,
        auditLogger: AuditLogger
    ) {
        self.userRepository = userRepository
        self.passwordService = passwordService
        self.tokenService = tokenService
        self.auditLogger = auditLogger
    }

    func execute(_ request: AuthenticationRequest) async throws -> AuthenticationResult {
        let user = try await userRepository.findByEmail(request.email)

        guard let user = user else {
            await auditLogger.logFailedLogin(email: request.email, reason: .userNotFound)
            throw AuthenticationError.invalidCredentials
        }

        let isPasswordValid = await passwordService.verify(
            password: request.password,
            against: user.passwordHash
        )

        guard isPasswordValid else {
            await auditLogger.logFailedLogin(email: request.email, reason: .invalidPassword)
            throw AuthenticationError.invalidCredentials
        }

        let token = tokenService.generateToken(for: user)
        await auditLogger.logSuccessfulLogin(userId: user.id)

        return AuthenticationResult(user: user, token: token)
    }
}
    `,

    repository: `
// Repository Pattern with Clean Interface
protocol UserRepository {
    func save(_ user: User) async throws
    func findById(_ id: UserID) async throws -> User?
    func findByEmail(_ email: Email) async throws -> User?
    func findActiveUsers(limit: Int) async throws -> [User]
    func remove(_ user: User) async throws
}

// Infrastructure Implementation
final class CoreDataUserRepository: UserRepository {
    private let context: NSManagedObjectContext

    init(context: NSManagedObjectContext) {
        self.context = context
    }

    func save(_ user: User) async throws {
        let managedUser = try findOrCreateManagedUser(for: user.id)
        managedUser.update(from: user)

        try context.save()
    }

    func findById(_ id: UserID) async throws -> User? {
        let fetchRequest = UserEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id == %@", id.value)
        fetchRequest.fetchLimit = 1

        let results = try context.fetch(fetchRequest)
        return results.first?.toDomainModel()
    }

    // Additional implementation...
}
    `
  };
}