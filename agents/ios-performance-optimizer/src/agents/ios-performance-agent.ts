/**
 * iOS Performance Agent
 *
 * Specialized agent for general iOS performance optimization including:
 * - Memory leak detection and retain cycle analysis
 * - CPU performance optimization
 * - Battery usage optimization
 * - Network performance
 * - Core Data optimization
 * - Background task efficiency
 */

export interface PerformanceIssue {
  type: 'memory' | 'cpu' | 'battery' | 'network' | 'storage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line?: number;
  description: string;
  recommendation: string;
  codeExample?: string;
}

export class IOSPerformanceAgent {
  /**
   * Common iOS performance anti-patterns and their fixes
   */
  static readonly PERFORMANCE_PATTERNS = {
    memoryLeaks: {
      patterns: [
        'weak self',
        'unowned self',
        'capture list',
        'delegate',
        'closure',
        'Timer',
        'NotificationCenter'
      ],
      issues: [
        'Strong reference cycles in closures',
        'Uncanceled timers',
        'Unremoved notification observers',
        'Delegate retain cycles'
      ]
    },

    cpuOptimization: {
      patterns: [
        'DispatchQueue.main',
        'async/await',
        'Task',
        'MainActor',
        '@MainActor'
      ],
      issues: [
        'Main thread blocking',
        'Heavy computation on main queue',
        'Synchronous network calls',
        'Inefficient algorithms'
      ]
    },

    batteryOptimization: {
      patterns: [
        'location services',
        'background modes',
        'network requests',
        'Core Location',
        'AVAudioSession'
      ],
      issues: [
        'Continuous location tracking',
        'Unnecessary background processing',
        'Frequent network requests',
        'Inefficient image processing'
      ]
    }
  };

  /**
   * Generate comprehensive performance analysis prompt
   */
  static generateAnalysisPrompt(filePath: string): string {
    return `
# iOS Performance Analysis for ${filePath}

## Analysis Focus Areas

### 1. Memory Management
- Look for strong reference cycles (retain cycles)
- Check for proper use of [weak self] or [unowned self] in closures
- Verify delegate patterns use weak references
- Identify leaked timers or notification observers
- Check for memory leaks in view controllers and custom classes

### 2. CPU Performance
- Identify main thread blocking operations
- Look for heavy computations that should be moved to background queues
- Check for inefficient loops or algorithms
- Verify proper use of async/await and structured concurrency
- Identify synchronous network calls or file operations

### 3. Battery Optimization
- Check location services usage and accuracy settings
- Review background processing and app lifecycle management
- Identify unnecessary work in background states
- Check for efficient image and media processing

### 4. Network Performance
- Look for network request optimization opportunities
- Check for proper caching strategies
- Verify request batching and connection reuse
- Identify opportunities for offline-first approaches

### 5. Core Data Optimization
- Check fetch request efficiency
- Look for N+1 query problems
- Verify proper use of batch operations
- Check for appropriate fetch limits and sorting

## Code Review Checklist
- [ ] Memory leaks and retain cycles
- [ ] Main thread usage
- [ ] Background task efficiency
- [ ] Network request patterns
- [ ] Image and media handling
- [ ] Core Data usage
- [ ] Timer and notification cleanup
- [ ] Proper async/await usage

Provide specific line numbers, explain the issues, and give concrete code examples for fixes.
    `;
  }

  /**
   * Common memory leak patterns to detect
   */
  static readonly MEMORY_LEAK_PATTERNS = [
    {
      pattern: /\[self\s+\w+/g,
      description: "Potential strong reference cycle - consider [weak self]",
      fix: "Use [weak self] in closure capture lists"
    },
    {
      pattern: /Timer\.scheduledTimer/g,
      description: "Timer may cause retain cycle",
      fix: "Invalidate timer in deinit and use weak references"
    },
    {
      pattern: /NotificationCenter\.default\.addObserver/g,
      description: "Notification observer may leak",
      fix: "Remove observer in deinit or use NotificationCenter.default.removeObserver"
    },
    {
      pattern: /delegate.*=.*self/g,
      description: "Delegate assignment may cause retain cycle",
      fix: "Ensure delegate property is marked as weak"
    }
  ];

  /**
   * CPU performance patterns to detect
   */
  static readonly CPU_PATTERNS = [
    {
      pattern: /DispatchQueue\.main\.sync/g,
      description: "Synchronous main queue call can cause deadlock",
      fix: "Use DispatchQueue.main.async instead"
    },
    {
      pattern: /URLSession\.shared\.dataTask.*\.resume\(\)/g,
      description: "Network call should be checked for main thread usage",
      fix: "Ensure network callbacks are handled on background queue"
    },
    {
      pattern: /for.*in.*\{[\s\S]*DispatchQueue\.main/g,
      description: "Loop with main queue calls can block UI",
      fix: "Move loop to background queue or batch main queue updates"
    }
  ];
}

/**
 * Performance optimization utilities
 */
export class PerformanceUtils {
  /**
   * Generate memory optimization recommendations
   */
  static generateMemoryOptimizations(issues: PerformanceIssue[]): string {
    const memoryIssues = issues.filter(issue => issue.type === 'memory');

    if (memoryIssues.length === 0) {
      return "✅ No memory issues detected";
    }

    return `
## 🧠 Memory Optimization Recommendations

${memoryIssues.map((issue, index) => `
### ${index + 1}. ${issue.file}${issue.line ? `:${issue.line}` : ''}
**Severity:** ${issue.severity.toUpperCase()}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}

${issue.codeExample ? `
\`\`\`swift
${issue.codeExample}
\`\`\`
` : ''}
`).join('')}
    `;
  }

  /**
   * Generate CPU optimization recommendations
   */
  static generateCPUOptimizations(issues: PerformanceIssue[]): string {
    const cpuIssues = issues.filter(issue => issue.type === 'cpu');

    if (cpuIssues.length === 0) {
      return "✅ No CPU performance issues detected";
    }

    return `
## ⚡ CPU Performance Optimization

${cpuIssues.map((issue, index) => `
### ${index + 1}. ${issue.file}${issue.line ? `:${issue.line}` : ''}
**Severity:** ${issue.severity.toUpperCase()}
**Issue:** ${issue.description}
**Fix:** ${issue.recommendation}

${issue.codeExample ? `
\`\`\`swift
${issue.codeExample}
\`\`\`
` : ''}
`).join('')}
    `;
  }

  /**
   * Generate comprehensive performance report
   */
  static generatePerformanceReport(issues: PerformanceIssue[]): string {
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');
    const mediumIssues = issues.filter(issue => issue.severity === 'medium');
    const lowIssues = issues.filter(issue => issue.severity === 'low');

    return `
# 📊 iOS Performance Analysis Report

## 📈 Summary
- **Critical Issues:** ${criticalIssues.length}
- **High Priority:** ${highIssues.length}
- **Medium Priority:** ${mediumIssues.length}
- **Low Priority:** ${lowIssues.length}

## 🎯 Priority Actions
${criticalIssues.length > 0 ? `
### ⚠️ Critical Issues (Fix Immediately)
${criticalIssues.map(issue => `- **${issue.file}**: ${issue.description}`).join('\n')}
` : ''}

${highIssues.length > 0 ? `
### 🔥 High Priority Issues
${highIssues.map(issue => `- **${issue.file}**: ${issue.description}`).join('\n')}
` : ''}

${this.generateMemoryOptimizations(issues)}

${this.generateCPUOptimizations(issues)}

## 📝 Next Steps
1. Fix critical and high-priority issues first
2. Run performance profiling with Instruments
3. Validate fixes with before/after metrics
4. Consider implementing automated performance monitoring
    `;
  }
}