
// kawi converted. Preserve this line, Kawi transpiler will not reprocess if this line found
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).babelPluginDynamicImportWebpack=e()}}(function(){return function(){return function e(n,r,t){function o(u,f){if(!r[u]){if(!n[u]){var p="function"==typeof require&&require;if(!f&&p)return p(u,!0);if(i)return i(u,!0);var a=new Error("Cannot find module '"+u+"'");throw a.code="MODULE_NOT_FOUND",a}var l=r[u]={exports:{}};n[u][0].call(l.exports,function(e){return o(n[u][1][e]||e)},l,l.exports,e,n,r,t)}return r[u].exports}for(var i="function"==typeof require&&require,u=0;u<t.length;u++)o(t[u]);return o}}()({1:[function(e,n,r){Object.defineProperty(r,"__esModule",{value:!0}),r.default=function(e){var n=(0,e.template)("\n  (new Promise((resolve) => {\n    require.ensure([], (require) => {\n      resolve(require(SOURCE));\n    });\n  }))\n");return{manipulateOptions:function(){return function(e,n){n.plugins.push("dynamicImport")}}(),visitor:{Import:function(){return function(e){var r=n({SOURCE:e.parentPath.node.arguments});e.parentPath.replaceWith(r)}}()}}}},{}]},{},[1])(1)});