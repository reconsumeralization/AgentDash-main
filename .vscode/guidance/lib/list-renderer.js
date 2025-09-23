/**
 * List Renderer - Fixes CLI list rendering issues
 * Addresses GitHub Issue #9020: CLI fails to render list items after the first one
 * 
 * This module provides robust list rendering functionality that ensures all list items
 * are properly displayed, not just the first one.
 */

class ListRenderer {
  constructor(options = {}) {
    this.options = {
      maxItems: options.maxItems || 1000,
      chunkSize: options.chunkSize || 50,
      renderDelay: options.renderDelay || 0,
      enablePagination: options.enablePagination || false,
      showProgress: options.showProgress || false,
      ...options
    };
    
    this.renderedItems = new Set();
    this.renderQueue = [];
    this.isRendering = false;
    this.renderStats = {
      totalItems: 0,
      renderedItems: 0,
      skippedItems: 0,
      errorItems: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Render a list of items with proper handling for large datasets
   */
  async renderList(items, options = {}) {
    const renderOptions = {
      ...this.options,
      ...options
    };

    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    if (items.length === 0) {
      return this.renderEmptyList();
    }

    this.renderStats = {
      totalItems: items.length,
      renderedItems: 0,
      skippedItems: 0,
      errorItems: 0,
      startTime: Date.now(),
      endTime: null
    };

    this.isRendering = true;
    this.renderedItems.clear();

    try {
      if (renderOptions.enablePagination && items.length > renderOptions.chunkSize) {
        return await this.renderPaginatedList(items, renderOptions);
      } else {
        return await this.renderAllItems(items, renderOptions);
      }
    } finally {
      this.isRendering = false;
      this.renderStats.endTime = Date.now();
    }
  }

  /**
   * Render all items in the list
   */
  async renderAllItems(items, options) {
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      try {
        const renderedItem = await this.renderItem(item, i, options);
        if (renderedItem) {
          results.push(renderedItem);
          this.renderedItems.add(i);
          this.renderStats.renderedItems++;
        } else {
          this.renderStats.skippedItems++;
        }
      } catch (error) {
        console.error(`Error rendering item ${i}:`, error.message);
        this.renderStats.errorItems++;
        
        // Add error item to results
        results.push(this.renderErrorItem(item, i, error, options));
      }

      // Add delay between renders if specified
      if (options.renderDelay > 0 && i < items.length - 1) {
        await this.delay(options.renderDelay);
      }

      // Show progress if enabled
      if (options.showProgress) {
        this.showProgress(i + 1, items.length);
      }
    }

    return {
      items: results,
      stats: this.renderStats,
      success: true
    };
  }

  /**
   * Render items in paginated chunks
   */
  async renderPaginatedList(items, options) {
    const chunks = this.chunkArray(items, options.chunkSize);
    const allResults = [];
    
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      const chunkResults = [];
      
      for (let i = 0; i < chunk.length; i++) {
        const globalIndex = (chunkIndex * options.chunkSize) + i;
        const item = chunk[i];
        
        try {
          const renderedItem = await this.renderItem(item, globalIndex, options);
          if (renderedItem) {
            chunkResults.push(renderedItem);
            this.renderedItems.add(globalIndex);
            this.renderStats.renderedItems++;
          } else {
            this.renderStats.skippedItems++;
          }
        } catch (error) {
          console.error(`Error rendering item ${globalIndex}:`, error.message);
          this.renderStats.errorItems++;
          chunkResults.push(this.renderErrorItem(item, globalIndex, error, options));
        }
      }
      
      allResults.push(...chunkResults);
      
      // Show progress for chunk
      if (options.showProgress) {
        this.showProgress(chunkIndex + 1, chunks.length, 'chunk');
      }
      
      // Add delay between chunks
      if (options.renderDelay > 0 && chunkIndex < chunks.length - 1) {
        await this.delay(options.renderDelay);
      }
    }

    return {
      items: allResults,
      stats: this.renderStats,
      success: true,
      paginated: true,
      totalChunks: chunks.length
    };
  }

  /**
   * Render a single item
   */
  async renderItem(item, index, options) {
    // Skip if already rendered
    if (this.renderedItems.has(index)) {
      return null;
    }

    // Validate item
    if (!this.validateItem(item)) {
      return null;
    }

    // Format item based on type
    const formattedItem = this.formatItem(item, index, options);
    
    return {
      index,
      data: item,
      formatted: formattedItem,
      rendered: true,
      timestamp: Date.now()
    };
  }

  /**
   * Render an error item
   */
  renderErrorItem(item, index, error, options) {
    return {
      index,
      data: item,
      formatted: `[ERROR] Item ${index}: ${error.message}`,
      rendered: false,
      error: error.message,
      timestamp: Date.now()
    };
  }

  /**
   * Render empty list message
   */
  renderEmptyList() {
    return {
      items: [],
      stats: {
        totalItems: 0,
        renderedItems: 0,
        skippedItems: 0,
        errorItems: 0,
        startTime: Date.now(),
        endTime: Date.now()
      },
      success: true,
      empty: true
    };
  }

  /**
   * Format an item based on its type
   */
  formatItem(item, index, options) {
    if (typeof item === 'string') {
      return this.formatStringItem(item, index, options);
    } else if (typeof item === 'object' && item !== null) {
      return this.formatObjectItem(item, index, options);
    } else if (typeof item === 'number') {
      return this.formatNumberItem(item, index, options);
    } else if (typeof item === 'boolean') {
      return this.formatBooleanItem(item, index, options);
    } else {
      return this.formatUnknownItem(item, index, options);
    }
  }

  /**
   * Format string items
   */
  formatStringItem(item, index, options) {
    const prefix = options.showIndex !== false ? `${index + 1}. ` : '';
    return `${prefix}${item}`;
  }

  /**
   * Format object items
   */
  formatObjectItem(item, index, options) {
    const prefix = options.showIndex !== false ? `${index + 1}. ` : '';
    
    if (options.objectFormat === 'json') {
      return `${prefix}${JSON.stringify(item, null, 2)}`;
    } else if (options.objectFormat === 'table') {
      return this.formatObjectAsTable(item, index, options);
    } else {
      // Default format
      const keys = Object.keys(item);
      if (keys.length === 0) {
        return `${prefix}{}`;
      } else if (keys.length === 1) {
        return `${prefix}${keys[0]}: ${item[keys[0]]}`;
      } else {
        return `${prefix}${keys.slice(0, 3).map(key => `${key}: ${item[key]}`).join(', ')}${keys.length > 3 ? '...' : ''}`;
      }
    }
  }

  /**
   * Format object as table
   */
  formatObjectAsTable(item, index, options) {
    const keys = Object.keys(item);
    if (keys.length === 0) return `${index + 1}. {}`;
    
    const maxWidth = options.maxColumnWidth || 20;
    const rows = keys.map(key => {
      const value = String(item[key]);
      const truncatedValue = value.length > maxWidth ? value.substring(0, maxWidth) + '...' : value;
      return `  ${key.padEnd(15)}: ${truncatedValue}`;
    });
    
    return `${index + 1}. {\n${rows.join('\n')}\n}`;
  }

  /**
   * Format number items
   */
  formatNumberItem(item, index, options) {
    const prefix = options.showIndex !== false ? `${index + 1}. ` : '';
    return `${prefix}${item}`;
  }

  /**
   * Format boolean items
   */
  formatBooleanItem(item, index, options) {
    const prefix = options.showIndex !== false ? `${index + 1}. ` : '';
    return `${prefix}${item ? 'true' : 'false'}`;
  }

  /**
   * Format unknown type items
   */
  formatUnknownItem(item, index, options) {
    const prefix = options.showIndex !== false ? `${index + 1}. ` : '';
    return `${prefix}[${typeof item}] ${String(item)}`;
  }

  /**
   * Validate an item before rendering
   */
  validateItem(item) {
    // Check for null/undefined
    if (item === null || item === undefined) {
      return false;
    }

    // Check for circular references in objects
    if (typeof item === 'object') {
      try {
        JSON.stringify(item);
        return true;
      } catch (error) {
        if (error.message.includes('circular')) {
          return false;
        }
        return true;
      }
    }

    return true;
  }

  /**
   * Show progress indicator
   */
  showProgress(current, total, type = 'item') {
    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percentage);
    
    if (type === 'chunk') {
      console.log(`\r📦 Rendering chunks: ${progressBar} ${percentage}% (${current}/${total} chunks)`);
    } else {
      console.log(`\r📋 Rendering items: ${progressBar} ${percentage}% (${current}/${total} items)`);
    }
  }

  /**
   * Create a progress bar
   */
  createProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  /**
   * Split array into chunks
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Delay execution
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get rendering statistics
   */
  getStats() {
    return {
      ...this.renderStats,
      duration: this.renderStats.endTime ? this.renderStats.endTime - this.renderStats.startTime : null,
      successRate: this.renderStats.totalItems > 0 ? 
        (this.renderStats.renderedItems / this.renderStats.totalItems) * 100 : 0
    };
  }

  /**
   * Reset renderer state
   */
  reset() {
    this.renderedItems.clear();
    this.renderQueue = [];
    this.isRendering = false;
    this.renderStats = {
      totalItems: 0,
      renderedItems: 0,
      skippedItems: 0,
      errorItems: 0,
      startTime: null,
      endTime: null
    };
  }

  /**
   * Check if renderer is currently rendering
   */
  isCurrentlyRendering() {
    return this.isRendering;
  }

  /**
   * Get list of rendered item indices
   */
  getRenderedIndices() {
    return Array.from(this.renderedItems);
  }

  /**
   * Check if an item has been rendered
   */
  isItemRendered(index) {
    return this.renderedItems.has(index);
  }

  /**
   * Render items with custom formatter
   */
  async renderWithCustomFormatter(items, formatter, options = {}) {
    if (typeof formatter !== 'function') {
      throw new Error('Formatter must be a function');
    }

    const results = [];
    
    for (let i = 0; i < items.length; i++) {
      try {
        const formatted = await formatter(items[i], i, options);
        results.push({
          index: i,
          data: items[i],
          formatted,
          rendered: true,
          timestamp: Date.now()
        });
        this.renderedItems.add(i);
        this.renderStats.renderedItems++;
      } catch (error) {
        console.error(`Error formatting item ${i}:`, error.message);
        results.push(this.renderErrorItem(items[i], i, error, options));
        this.renderStats.errorItems++;
      }
    }

    return {
      items: results,
      stats: this.renderStats,
      success: true,
      customFormatter: true
    };
  }

  /**
   * Render items with filtering
   */
  async renderWithFilter(items, filter, options = {}) {
    if (typeof filter !== 'function') {
      throw new Error('Filter must be a function');
    }

    const filteredItems = items.filter((item, index) => filter(item, index));
    return await this.renderList(filteredItems, options);
  }

  /**
   * Render items with sorting
   */
  async renderWithSort(items, sortFunction, options = {}) {
    if (typeof sortFunction !== 'function') {
      throw new Error('Sort function must be a function');
    }

    const sortedItems = [...items].sort(sortFunction);
    return await this.renderList(sortedItems, options);
  }
}

module.exports = ListRenderer;
