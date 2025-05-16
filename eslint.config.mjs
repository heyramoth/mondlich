import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import css from "@eslint/css";
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig } from "eslint/config";
import eslintPluginImport from 'eslint-plugin-import'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
        plugins: {
            js,
            '@stylistic': stylistic,
            '@typescript-eslint': tseslint.plugin,
            '@eslint-plugin-import': eslintPluginImport,
        },
        languageOptions: {
            globals: globals.browser,
            parser: tseslint.parser,
            parserOptions: {
                project: true,
                tsconfigRootDir: __dirname,
            }
        },
        rules: {
            /* Error level */
            'no-use-before-define': ['warn', {
                classes: false,
                variables: false,
                functions: false,
            }],
            'object-curly-newline': ['error', {
                ImportDeclaration: {
                    multiline: true,
                    minProperties: 3,
                },
                ExportDeclaration: 'never',
                ObjectExpression: {
                    multiline: true,
                    minProperties: 4,
                },
                ObjectPattern: {
                    multiline: true,
                    minProperties: 4,
                },
            }],
            'no-multi-spaces': 'error',

            '@stylistic/indent': ['error', 2],
            '@stylistic/quotes': ['error', 'single'],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/member-delimiter-style': ['error', {
                multiline: {
                    delimiter: 'comma',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'comma',
                    requireLast: false,
                },
            }],
            '@stylistic/padding-line-between-statements': [
                'error',
                {
                    blankLine: 'always',
                    prev: 'multiline-const',
                    next: 'multiline-const',
                },
            ],
            '@stylistic/array-bracket-spacing': ['error', 'never'],
            '@stylistic/object-curly-spacing': ['error', 'always'],
            '@stylistic/space-infix-ops': ['error'],
            '@stylistic/comma-dangle': ['error', {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'always-multiline',
                enums: 'always-multiline',
                generics: 'always-multiline',
                tuples: 'always-multiline',
            }],
            '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
            '@stylistic/type-annotation-spacing': 'error',
            '@stylistic/object-property-newline': ['error', { allowMultiplePropertiesPerLine: false }],
            '@stylistic/no-extra-parens': ['error', 'all', {
                ignoreJSX: 'multi-line',
                enforceForArrowConditionals: false,
                nestedBinaryExpressions: false,
            }],

            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/explicit-function-return-type': [
                'off',
                { allowExpressions: true }
            ],
            '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions', 'constructors'] }],

            /* Warn level */
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@eslint-plugin-import/no-unused-modules': 'warn',
            '@stylistic/max-len': ['warn', {
                code: 120,
                ignoreUrls: true,
                ignoreRegExpLiterals: true,
                ignoreComments: true,
                ignoreTrailingComments: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignorePattern: '^import .*',
            }],
            camelcase: 'warn',
            'consistent-return': 'warn',
            'no-param-reassign': 'warn',
            'default-param-last': 'warn',
            'no-promise-executor-return': 'warn',
        }
    },
    {
        files: ["**/*.json"],
        plugins: { json },
        language: "json/json",
        extends: ["json/recommended"]
    },
    {
        files: ["**/*.css"],
        plugins: { css },
        language: "css/css",
        extends: ["css/recommended"]
    },
]);
