# TODO: プロジェクトセットアップ

作成日: 2025-01-31
ステータス: 🔴 未着手

## 概要

GitHub自動リリースノート作成アクションの開発環境をセットアップし、基本的なプロジェクト構造を構築します。TypeScript + Node.js環境で、GitHub Actionsとして動作するカスタムアクションの基盤を整えます。

## タスク一覧

### ✅ プロジェクト初期化

- [ ] プロジェクトディレクトリの作成
- [ ] `npm init` または `pnpm init` でpackage.json作成
- [ ] .gitignoreファイルの作成（node_modules, dist, .env等）
- [ ] LICENSEファイルの作成（MIT推奨）

### ✅ TypeScript環境構築

- [ ] TypeScript, ts-node, @types/nodeのインストール
- [ ] tsconfig.jsonの作成と設定
  - target: ES2022
  - module: commonjs
  - outDir: dist
  - strict: true
- [ ] ビルドスクリプトの追加（`npm run build`）

### ✅ GitHub Actions関連パッケージ

- [ ] @actions/coreのインストール（^1.10.0）
- [ ] @actions/githubのインストール（^6.0.0）
- [ ] @octokit/restのインストール（^20.0.0）
- [ ] conventional-commits-parserのインストール（^5.0.0）

### ✅ 開発ツール設定

- [ ] ESLintのインストールと設定
  - @typescript-eslint/parser
  - @typescript-eslint/eslint-plugin
- [ ] Prettierのインストールと設定
  - .prettierrc.jsonの作成
- [ ] huskyとlint-stagedの設定（オプション）

### ✅ プロジェクト構造作成

- [ ] srcディレクトリの作成
- [ ] testsディレクトリの作成
- [ ] src/main.tsの作成（エントリーポイント）
- [ ] action.ymlファイルの作成

### ✅ action.yml基本設定

- [ ] name, description, authorの記述
- [ ] inputs定義
  - github-token（必須）
  - template（オプション、default: standard）
  - changelog-file（オプション、default: CHANGELOG.md）
  - version-file（オプション、default: true）
  - create-github-release（オプション、default: true）
  - exclude-labels（オプション）
  - dry-run（オプション、default: false）
- [ ] outputs定義
  - release-notes
  - version
  - changelog-url
- [ ] runs設定（using: node20, main: dist/index.js）

### ✅ バージョン管理とビルド

- [ ] Gitリポジトリの初期化（git init）
- [ ] 初回コミット
- [ ] package.jsonにビルド・テストスクリプト追加
- [ ] nccまたはwebpackでバンドル設定（dist/index.js生成）

### ✅ 開発環境確認

- [ ] TypeScriptのコンパイルが正常に動作することを確認
- [ ] ESLintが正常に動作することを確認
- [ ] ビルドスクリプトでdist/index.jsが生成されることを確認

## 完了条件

- [x] package.jsonに全ての必要な依存関係が記載されている
- [x] tsconfig.jsonが適切に設定され、TypeScriptコンパイルが動作する
- [x] action.ymlが基本的な入出力定義を含んでいる
- [x] プロジェクト構造（src, tests, dist）が整っている
- [x] ビルドコマンド（npm run build）が正常に動作する
- [x] ESLint/Prettierによるコード品質チェックが機能する

## メモ

### 推奨パッケージバージョン
```json
{
  "dependencies": {
    "@actions/core": "^1.10.0",
    "@actions/github": "^6.0.0",
    "@octokit/rest": "^20.0.0",
    "conventional-commits-parser": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vercel/ncc": "^0.38.0",
    "eslint": "^8.50.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0"
  }
}
```

### ビルドコマンド例
```bash
# TypeScriptコンパイル + nccでバンドル
npm run build
# または
tsc && ncc build src/main.ts -o dist
```

### 参考リンク
- [GitHub Actions TypeScriptテンプレート](https://github.com/actions/typescript-action)
- [actions/toolkit documentation](https://github.com/actions/toolkit)
- [Conventional Commits仕様](https://www.conventionalcommits.org/)
