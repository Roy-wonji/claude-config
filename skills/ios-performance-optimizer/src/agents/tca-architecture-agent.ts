/**
 * TCA (The Composable Architecture) Optimization Agent
 *
 * Specialized agent for TCA architecture optimization including:
 * - Store performance optimization
 * - Effect management and cancellation
 * - Reducer composition efficiency
 * - State normalization
 * - ViewStore optimization
 * - Dependency injection patterns
 */

export interface TCAIssue {
  type: 'store' | 'effect' | 'reducer' | 'state' | 'viewstore' | 'dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
  codeExample?: string;
}

export class TCAArchitectureAgent {
  /**
   * Common TCA performance patterns
   */
  static readonly TCA_PATTERNS = {
    storeOptimization: {
      patterns: [
        'Store(',
        'ViewStore(',
        'WithViewStore',
        'observe',
        'send'
      ],
      issues: [
        'Unnecessary store observations',
        'ViewStore over-subscription',
        'Heavy state computations in views',
        'Missing store scoping'
      ]
    },

    effectOptimization: {
      patterns: [
        'Effect.',
        '.cancellable',
        '.receive(on:)',
        'publisher.eraseToEffect()',
        'Effect.run'
      ],
      issues: [
        'Uncanceled effects',
        'Missing effect cancellation IDs',
        'Inefficient publisher chains',
        'Main thread effect execution'
      ]
    },

    reducerOptimization: {
      patterns: [
        'Reducer {',
        'reduce(into:action:)',
        'Scope',
        'forEach',
        'pullback'
      ],
      issues: [
        'Heavy reducer computations',
        'Missing reducer composition',
        'Inefficient state mutations',
        'Unnecessary state copying'
      ]
    }
  };

  /**
   * TCA Store optimization patterns
   */
  static readonly STORE_PATTERNS = [
    {
      pattern: /ViewStore\([^,]+,\s*observe:\s*\{\s*\$0\s*\}/g,
      description: "ViewStore observing entire state - should scope to specific properties",
      fix: "Scope ViewStore to only observe necessary state properties"
    },
    {
      pattern: /\.observe\s*\{\s*\$0\s*\}/g,
      description: "Observing entire state can cause unnecessary view updates",
      fix: "Use specific property observations or computed properties"
    },
    {
      pattern: /WithViewStore.*\{\s*viewStore\s*in[\s\S]*viewStore\.state\./g,
      description: "Potential ViewStore over-observation",
      fix: "Consider using @ObservedObject store or specific state observations"
    }
  ];

  /**
   * Effect optimization patterns
   */
  static readonly EFFECT_PATTERNS = [
    {
      pattern: /Effect\.[^.]+\.eraseToAnyPublisher\(\)/g,
      description: "Effect without cancellation ID may leak",
      fix: "Add .cancellable(id:) for proper effect cancellation"
    },
    {
      pattern: /\.receive\(on:\s*DispatchQueue\.main\)/g,
      description: "Effect explicitly receiving on main queue - check if necessary",
      fix: "TCA automatically receives actions on main queue"
    },
    {
      pattern: /Effect\.fireAndForget/g,
      description: "Fire-and-forget effect cannot be canceled",
      fix: "Consider using Effect.run with proper cancellation"
    }
  ];

  /**
   * Generate TCA analysis prompt
   */
  static generateTCAAnalysisPrompt(filePath: string): string {
    return `
# TCA Architecture Analysis for ${filePath}

## Analysis Focus Areas

### 1. Store Performance
- Check ViewStore observations for over-subscription
- Verify proper store scoping and state selection
- Look for unnecessary state computations in views
- Check for proper store composition patterns

### 2. Effect Management
- Verify all effects have proper cancellation strategies
- Check for effect leaks and uncanceled subscriptions
- Review effect scheduling and threading
- Look for opportunities to batch effects

### 3. Reducer Optimization
- Check for heavy computations in reducers
- Verify efficient state mutations
- Look for opportunities for reducer composition
- Check for unnecessary state copying

### 4. State Architecture
- Verify state normalization and structure
- Check for derived state vs stored state decisions
- Look for state sharing opportunities
- Verify proper state scoping

### 5. Dependency Injection
- Check dependency usage patterns
- Verify proper dependency scoping
- Look for dependency over-injection
- Check for test-friendly dependency patterns

## TCA Best Practices Checklist
- [ ] ViewStore observations are scoped to necessary state
- [ ] Effects have proper cancellation IDs
- [ ] Reducers are pure and efficient
- [ ] State is properly normalized
- [ ] Dependencies are properly scoped
- [ ] No retain cycles in effects
- [ ] Proper use of Effect.run vs Effect.publisher
- [ ] Efficient state updates

Provide specific TCA optimization recommendations with code examples.
    `;
  }

  /**
   * Generate TCA optimization recommendations
   */
  static generateOptimizationReport(issues: TCAIssue[]): string {
    const storeIssues = issues.filter(issue => issue.type === 'store');
    const effectIssues = issues.filter(issue => issue.type === 'effect');
    const reducerIssues = issues.filter(issue => issue.type === 'reducer');

    return `
# 🏗️ TCA Architecture Optimization Report

## 📊 Store Performance
${storeIssues.length > 0 ? `
### Store Optimization Issues
${storeIssues.map((issue, index) => `
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
` : '✅ No store performance issues detected'}

## ⚡ Effect Management
${effectIssues.length > 0 ? `
### Effect Optimization Issues
${effectIssues.map((issue, index) => `
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
` : '✅ No effect management issues detected'}

## 🔄 Reducer Efficiency
${reducerIssues.length > 0 ? `
### Reducer Optimization Issues
${reducerIssues.map((issue, index) => `
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
` : '✅ No reducer performance issues detected'}

## 📝 TCA Optimization Guidelines

### Store Best Practices
1. **Scope ViewStore observations**: Only observe the state properties you need
2. **Use derived state**: Compute derived values in state rather than views
3. **Optimize store composition**: Use proper store scoping for child features

### Effect Best Practices
1. **Always provide cancellation IDs**: Use .cancellable(id:) for all long-running effects
2. **Cancel effects on deinit**: Implement proper cleanup in reducers
3. **Use Effect.run for async/await**: Prefer modern concurrency patterns

### Reducer Best Practices
1. **Keep reducers pure**: No side effects in reduce functions
2. **Minimize state copying**: Use efficient state update patterns
3. **Compose reducers**: Break complex reducers into smaller, focused ones

## 🎯 Action Items
1. Fix critical TCA architecture issues
2. Implement proper effect cancellation
3. Optimize ViewStore observations
4. Review state architecture for normalization opportunities
    `;
  }
}