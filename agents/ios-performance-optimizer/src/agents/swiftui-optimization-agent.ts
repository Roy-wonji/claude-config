/**
 * SwiftUI Optimization Agent
 *
 * Specialized agent for SwiftUI performance optimization including:
 * - View invalidation analysis
 * - Identity management in lists
 * - Layout optimization
 * - @Observable and @State optimization
 * - Animation performance
 * - Lazy loading patterns
 */

export interface SwiftUIIssue {
  type: 'invalidation' | 'identity' | 'layout' | 'state' | 'animation' | 'loading';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
  codeExample?: string;
}

export class SwiftUIOptimizationAgent {
  /**
   * SwiftUI performance patterns
   */
  static readonly SWIFTUI_PATTERNS = {
    invalidation: {
      patterns: [
        '@State',
        '@Observable',
        '@Published',
        'objectWillChange',
        'body'
      ],
      issues: [
        'Broad state observations',
        'Unnecessary view updates',
        'Heavy computations in body',
        'State invalidation storms'
      ]
    },

    identity: {
      patterns: [
        'ForEach',
        'List',
        'id:',
        'Identifiable',
        '.id('
      ],
      issues: [
        'Unstable ForEach identity',
        'Missing Identifiable conformance',
        'UUID() in view body',
        'Identity churn in lists'
      ]
    },

    layout: {
      patterns: [
        'GeometryReader',
        'LazyVStack',
        'LazyHStack',
        'ScrollView',
        'VStack',
        'HStack'
      ],
      issues: [
        'GeometryReader in lazy stacks',
        'Deep view hierarchies',
        'Unnecessary layout passes',
        'Complex layout calculations'
      ]
    }
  };

  /**
   * View invalidation patterns to detect
   */
  static readonly INVALIDATION_PATTERNS = [
    {
      pattern: /@Observable.*class.*\{[\s\S]*var.*:.*\{[\s\S]*didSet/g,
      description: "Observable class with didSet may cause invalidation storms",
      fix: "Use @Observable without didSet observers for automatic tracking"
    },
    {
      pattern: /body.*\{[\s\S]*\.filter\(|\.sorted\(|\.map\(/g,
      description: "Collection operations in body cause unnecessary recomputation",
      fix: "Move expensive operations to @State or computed properties"
    },
    {
      pattern: /@State.*=.*\{[\s\S]*\}/g,
      description: "Complex @State initialization may impact performance",
      fix: "Initialize complex state in .task or .onAppear modifiers"
    }
  ];

  /**
   * Identity management patterns
   */
  static readonly IDENTITY_PATTERNS = [
    {
      pattern: /ForEach\([^,]+,\s*id:\s*\\\.self\)/g,
      description: "Using id: \\.self may cause identity issues for non-hashable types",
      fix: "Ensure type conforms to Hashable or use stable ID property"
    },
    {
      pattern: /UUID\(\)/g,
      description: "UUID() in view body creates new identity on every render",
      fix: "Generate UUID in @State initialization or use stable identifier"
    },
    {
      pattern: /\.id\(UUID\(\)\)/g,
      description: "Using .id(UUID()) destroys view identity on every update",
      fix: "Use stable identifier or @State variable for view ID"
    }
  ];

  /**
   * Layout optimization patterns
   */
  static readonly LAYOUT_PATTERNS = [
    {
      pattern: /LazyVStack[\s\S]*GeometryReader/g,
      description: "GeometryReader inside LazyVStack defeats lazy loading",
      fix: "Use .onGeometryChange (iOS 18+) or move GeometryReader outside"
    },
    {
      pattern: /VStack\s*\{[\s\S]*\{[\s\S]*VStack/g,
      description: "Nested VStack may cause layout inefficiency",
      fix: "Flatten view hierarchy or use LazyVStack for long lists"
    },
    {
      pattern: /\.frame\(.*\)[\s\S]*\.frame\(/g,
      description: "Multiple frame modifiers may cause redundant layout",
      fix: "Combine frame modifications or use single comprehensive frame call"
    }
  ];

  /**
   * Generate SwiftUI analysis prompt
   */
  static generateSwiftUIAnalysisPrompt(filePath: string): string {
    return `
# SwiftUI Performance Analysis for ${filePath}

## Analysis Focus Areas

### 1. View Invalidation
- Check for broad state observations causing unnecessary updates
- Look for heavy computations in view body
- Verify efficient use of @Observable vs @Published
- Identify state invalidation storms

### 2. Identity Management
- Check ForEach and List identity stability
- Verify proper use of Identifiable protocol
- Look for UUID() usage in view body
- Check for identity churn in dynamic lists

### 3. Layout Optimization
- Identify inefficient layout patterns
- Check for GeometryReader misuse in lazy containers
- Look for unnecessary layout calculations
- Verify proper use of lazy loading

### 4. State Management
- Check @State vs @Observable usage patterns
- Look for state over-subscription
- Verify efficient state updates
- Check for derived state patterns

### 5. Animation Performance
- Check animation scope and efficiency
- Look for over-animated view hierarchies
- Verify animation value binding performance
- Check for unnecessary animation triggers

### 6. List Performance
- Check LazyVStack/LazyHStack usage
- Verify proper list item identity
- Look for scroll performance issues
- Check for efficient data loading patterns

## SwiftUI Best Practices Checklist
- [ ] No heavy computation in view body
- [ ] Stable identity in ForEach and List
- [ ] Proper @Observable property access
- [ ] Efficient layout hierarchy
- [ ] No GeometryReader in lazy containers
- [ ] Scoped animation usage
- [ ] Efficient state management
- [ ] Proper lazy loading patterns

Provide specific SwiftUI optimization recommendations with before/after code examples.
    `;
  }

  /**
   * Generate SwiftUI optimization report
   */
  static generateOptimizationReport(issues: SwiftUIIssue[]): string {
    const invalidationIssues = issues.filter(issue => issue.type === 'invalidation');
    const identityIssues = issues.filter(issue => issue.type === 'identity');
    const layoutIssues = issues.filter(issue => issue.type === 'layout');
    const stateIssues = issues.filter(issue => issue.type === 'state');

    return `
# 🎨 SwiftUI Performance Optimization Report

## 🔄 View Invalidation Analysis
${invalidationIssues.length > 0 ? `
### Invalidation Issues
${invalidationIssues.map((issue, index) => `
#### ${index + 1}. ${issue.file}${issue.line ? `:${issue.line}` : ''}
**Severity:** ${issue.severity.toUpperCase()}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}

${issue.codeExample ? `
\`\`\`swift
${issue.codeExample}
\`\`\`
` : ''}
`).join('')}
` : '✅ No view invalidation issues detected'}

## 🆔 Identity Management
${identityIssues.length > 0 ? `
### Identity Issues
${identityIssues.map((issue, index) => `
#### ${index + 1}. ${issue.file}${issue.line ? `:${issue.line}` : ''}
**Severity:** ${issue.severity.toUpperCase()}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}

${issue.codeExample ? `
\`\`\`swift
${issue.codeExample}
\`\`\`
` : ''}
`).join('')}
` : '✅ No identity management issues detected'}

## 📐 Layout Optimization
${layoutIssues.length > 0 ? `
### Layout Issues
${layoutIssues.map((issue, index) => `
#### ${index + 1}. ${issue.file}${issue.line ? `:${issue.line}` : ''}
**Severity:** ${issue.severity.toUpperCase()}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}

${issue.codeExample ? `
\`\`\`swift
${issue.codeExample}
\`\`\`
` : ''}
`).join('')}
` : '✅ No layout optimization issues detected'}

## 🏪 State Management
${stateIssues.length > 0 ? `
### State Management Issues
${stateIssues.map((issue, index) => `
#### ${index + 1}. ${issue.file}${issue.line ? `:${issue.line}` : ''}
**Severity:** ${issue.severity.toUpperCase()}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}

${issue.codeExample ? `
\`\`\`swift
${issue.codeExample}
\`\`\`
` : ''}
`).join('')}
` : '✅ No state management issues detected'}

## 📊 SwiftUI Performance Guidelines

### View Invalidation Best Practices
1. **Minimize body computation**: Move expensive operations out of view body
2. **Use @Observable efficiently**: Only read properties you need to observe
3. **Scope state properly**: Keep state as local as possible

### Identity Best Practices
1. **Stable ForEach identity**: Use stable identifiers, avoid UUID() in body
2. **Implement Identifiable**: Conform types to Identifiable when possible
3. **Consistent view identity**: Avoid changing view type in conditional logic

### Layout Best Practices
1. **Avoid GeometryReader in lazy containers**: Use .onGeometryChange when available
2. **Flatten view hierarchies**: Minimize nested container views
3. **Use appropriate containers**: LazyVStack for large lists, VStack for small content

### State Management Best Practices
1. **Choose right property wrapper**: @State for local state, @Observable for shared state
2. **Derived state patterns**: Use computed properties for derived values
3. **Efficient updates**: Update only the state that changed

## 🎯 Performance Action Plan
1. Fix critical SwiftUI performance issues
2. Optimize view invalidation patterns
3. Stabilize view identity in lists
4. Improve layout efficiency
5. Profile with SwiftUI Instruments template
    `;
  }

  /**
   * SwiftUI code optimization examples
   */
  static readonly CODE_EXAMPLES = {
    invalidationOptimization: `
// ❌ Before: Heavy computation in body
var body: some View {
    let processedItems = items.filter { $0.isActive }.sorted { $0.name < $1.name }
    List(processedItems) { item in
        ItemRow(item: item)
    }
}

// ✅ After: Move computation to @State
@State private var processedItems: [Item] = []

var body: some View {
    List(processedItems) { item in
        ItemRow(item: item)
    }
    .task {
        processedItems = items.filter { $0.isActive }.sorted { $0.name < $1.name }
    }
    .onChange(of: items) {
        processedItems = items.filter { $0.isActive }.sorted { $0.name < $1.name }
    }
}
    `,

    identityOptimization: `
// ❌ Before: Unstable identity
ForEach(items, id: \\.self) { item in
    ItemView(item: item)
        .id(UUID()) // Creates new identity each render
}

// ✅ After: Stable identity
ForEach(items) { item in // items conform to Identifiable
    ItemView(item: item)
        .id(item.id) // Use stable item ID
}
    `,

    layoutOptimization: `
// ❌ Before: GeometryReader in lazy container
LazyVStack {
    ForEach(items) { item in
        GeometryReader { geometry in
            ItemView(item: item, width: geometry.size.width)
        }
    }
}

// ✅ After: Move GeometryReader outside or use onGeometryChange
GeometryReader { geometry in
    LazyVStack {
        ForEach(items) { item in
            ItemView(item: item, width: geometry.size.width)
        }
    }
}
    `
  };
}