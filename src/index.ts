import { Compiler, compilation } from 'webpack';

export interface HtmlTagObject {
  tagName: string;
  innerHTML?: string;
  attributes?: Record<string, string>;
}

export interface HtmlWebpackCodeInjectPluginOptions {
  /**
   * Inject custom code to <head>...</head>.
   */
  headHtmlTagObjectList?: HtmlTagObject[];
  /**
   * Inject custom code to <body>...</body>.
   */
  bodyHtmlTagObjectList?: HtmlTagObject[];
  /**
   * Inject custom code to <head>...</head> by callback.
   */
  headCallback?: (headContent: string) => string;
  /**
   * Inject custom code to <body>...</body> by callback.
   */
  bodyCallback?: (bodyContent: string) => string;
  /**
   * Exclude files by callback.
   */
  excludeFileCallback?: (fileName: string) => boolean;
  /**
   * include files by callback.
   */
  includeFileCallback?: (fileName: string) => boolean;
}

function isArray(field: any): boolean {
  return Object.prototype.toString.call(field).slice(8, -1).toLowerCase() === "array";
}

function generateHtmlTag(tag: HtmlTagObject): string {
  const { tagName, innerHTML, attributes } = tag;
  let html = `<${tagName}`;
  
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      html += ` ${key}="${value}"`;
    });
  }
  
  if (innerHTML) {
    html += `>${innerHTML}</${tagName}>`;
  } else {
    html += ' />';
  }
  
  return html;
}

export default class HtmlWebpackCodeInjectPlugin {
  private readonly options: HtmlWebpackCodeInjectPluginOptions;

  constructor(options: HtmlWebpackCodeInjectPluginOptions = {}) {
    this.options = options;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.emit.tapAsync(
      'HtmlWebpackCodeInjectPlugin',
      (compilation: compilation.Compilation, callback: () => void) => {
        const htmlFiles = Object.keys(compilation.assets).filter(filename => filename.endsWith('.html'));
        
        htmlFiles.forEach(filename => {
          const { excludeFileCallback, includeFileCallback } = this.options;
          
          if (includeFileCallback && typeof includeFileCallback === "function") {
            if (!includeFileCallback(filename)) {
              console.log(`\nNot include ${filename}, exclude it.`);
              return;
            }
          }
          
          if (excludeFileCallback && typeof excludeFileCallback === "function") {
            if (excludeFileCallback(filename)) {
              console.log(`\nExclude ${filename}, exclude it.`);
              return;
            }
          }
          
          let htmlContent = compilation.assets[filename].source().toString();
          
          // 处理head标签注入
          const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
          if (headMatch) {
            let headContent = headMatch[1];
            const { headHtmlTagObjectList, headCallback } = this.options;
            
            if (headHtmlTagObjectList && isArray(headHtmlTagObjectList)) {
              const headTags = headHtmlTagObjectList.map(generateHtmlTag).join('\n');
              headContent += headTags;
            }
            
            if (headCallback && typeof headCallback === "function") {
              headContent = headCallback(headContent);
            }
            
            htmlContent = htmlContent.replace(headMatch[0], `<head>${headContent}</head>`);
          }
          
          // 处理body标签注入
          const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          if (bodyMatch) {
            let bodyContent = bodyMatch[1];
            const { bodyHtmlTagObjectList, bodyCallback } = this.options;
            
            if (bodyHtmlTagObjectList && isArray(bodyHtmlTagObjectList)) {
              const bodyTags = bodyHtmlTagObjectList.map(generateHtmlTag).join('\n');
              bodyContent += bodyTags;
            }
            
            if (bodyCallback && typeof bodyCallback === "function") {
              bodyContent = bodyCallback(bodyContent);
            }
            
            htmlContent = htmlContent.replace(bodyMatch[0], `<body>${bodyContent}</body>`);
          }
          
          // 更新资源
          compilation.assets[filename] = {
            source: () => htmlContent,
            size: () => htmlContent.length
          };
        });
        
        callback();
      }
    );
  }
}
