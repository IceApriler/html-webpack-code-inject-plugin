import { Compiler, compilation } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export interface HtmlWebpackCodeInjectPluginOptions {
  /**
   * Inject custom code to <head>...</head>.
   */
  headHtmlTagObjectList?: HtmlWebpackPlugin.HtmlTagObject[];
  /**
   * Inject custom code to <body>...</body>.
   */
  bodyHtmlTagObjectList?: HtmlWebpackPlugin.HtmlTagObject[];
  /**
   * Inject custom code to <head>...</head> by callback.
   */
  headCallback?: (headTags: HtmlWebpackPlugin.HtmlTagObject[]) => HtmlWebpackPlugin.HtmlTagObject[];
  /**
   * Inject custom code to <body>...</body> by callback.
   */
  bodyCallback?: (bodyTags: HtmlWebpackPlugin.HtmlTagObject[]) => HtmlWebpackPlugin.HtmlTagObject[];
  /**
   * Exclude files by callback.
   */
  excludeFileCallback?: (fimeName: string) => boolean;
  /**
   * include files by callback.
   */
  includeFileCallback?: (fimeName: string) => boolean;
}

function isArray(field: any): boolean {
  return Object.prototype.toString.call(field).slice(8, -1).toLowerCase() === "array"
}

export default class HtmlWebpackCodeInjectPlugin {
  private readonly options: HtmlWebpackCodeInjectPluginOptions;

  constructor(options: HtmlWebpackCodeInjectPluginOptions = { }) {
    this.options = options;
  }
  

  apply(compiler: Compiler): void {

    const plugin = 'HtmlWebpackCodeInjectPlugin';
    compiler.hooks.compilation.tap(
      plugin,
      (compilation: compilation.Compilation) => {
        const hooks: HtmlWebpackPlugin.Hooks = HtmlWebpackPlugin.getHooks(compilation)
        hooks.alterAssetTagGroups.tap(
          'InsertScriptWebpackPlugin',
          (htmlPluginData): any => {
            const { headHtmlTagObjectList, bodyHtmlTagObjectList, excludeFileCallback, includeFileCallback, headCallback, bodyCallback } = this.options
            const { outputName } = htmlPluginData
            if (includeFileCallback && typeof includeFileCallback === "function") {
              if (!includeFileCallback(outputName)) {
                console.log('\n')
                console.log(`Not include ${outputName}, exclude it.`)
                return
              }
            }
            if (excludeFileCallback && typeof excludeFileCallback === "function") {
              if (excludeFileCallback(outputName)) {
                console.log('\n')
                console.log(`Exclude ${outputName}, exclude it.`)
                return
              }
            }
            if (headHtmlTagObjectList && isArray(headHtmlTagObjectList)) {
              htmlPluginData.headTags.push(...headHtmlTagObjectList)
            }
            
            if (bodyHtmlTagObjectList && isArray(bodyHtmlTagObjectList)) {
              htmlPluginData.headTags.push(...bodyHtmlTagObjectList)
            }
            
            if (headCallback && typeof headCallback === "function") {
              htmlPluginData.headTags = headCallback(htmlPluginData.headTags)
            }
            if (bodyCallback && typeof bodyCallback === "function") {
              htmlPluginData.bodyTags = bodyCallback(htmlPluginData.bodyTags)
            }
          }
        )
      },
    );
  }
}
