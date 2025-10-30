# TODO: テストとドキュメント

作成日: 2025-01-31
ステータス: 🔴 未着手

## 概要

アクションの品質と保守性を確保するために、ユニットテスト、E2Eテスト、包括的なドキュメントを作成します。80%以上のコードカバレッジを目標とし、使用方法を明確に説明するREADMEと実用的な使用例を提供します。

## タスク一覧

### ✅ テスト環境構築

- [ ] Jestのインストールと設定
  ```bash
  npm install --save-dev jest @types/jest ts-jest
  ```
- [ ] jest.config.jsの作成
  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  };
  ```
- [ ] package.jsonにテストスクリプト追加
  ```json
  {
    "scripts": {
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage"
    }
  }
  ```
- [ ] @actions/github, @actions/coreのモック設定

### ✅ ユニットテスト作成（tests/unit/）

- [ ] utils.test.ts
  - isValidSemver()のテスト
    - 正常系: v1.0.0, v2.3.5, v1.0.0-beta.1
    - 異常系: 1.0.0, version-1.0.0, invalid
  - extractVersion()のテスト
  - formatDate()のテスト
  - generateCompareUrl()のテスト

- [ ] parser.test.ts
  - Conventional Commits解析のテスト
    - feat, fix, docs等の各タイプ
    - scopeの有無
    - Breaking Changesの検出
  - 不正な形式のコミットメッセージ
  - 空のコミットメッセージ

- [ ] categorizer.test.ts
  - Conventional Commitsによる分類
  - GitHubラベルによる分類
  - 優先順位の確認（Breaking > Features > Fixes）
  - 分類不可能な場合のフォールバック

- [ ] filter.test.ts
  - choreコミットの除外
  - 特定ラベルPRの除外
  - マージコミットの除外
  - 複数フィルター条件の組み合わせ

- [ ] contributors.test.ts
  - 重複排除
  - botアカウント除外
  - アルファベット順ソート
  - 空リストの処理

- [ ] validator.test.ts
  - タグ形式バリデーション
  - 入力パラメータ検証
  - ファイルパスバリデーション

- [ ] templates/standard.test.ts
  - テンプレート生成のテスト
  - カテゴリフォーマットのテスト
  - 空のカテゴリの処理

### ✅ 統合テスト作成（tests/integration/）

- [ ] collector.integration.test.ts
  - GitHub API呼び出しのモックテスト
  - ページネーション処理
  - 複数PRの取得
  - エラーハンドリング

- [ ] writer.integration.test.ts
  - CHANGELOG.md書き込みテスト
  - 既存ファイルへの追記テスト
  - 個別バージョンファイル作成テスト
  - ファイルが存在しない場合の初期化

- [ ] releases.integration.test.ts
  - GitHub Release作成のモックテスト
  - プレリリース判定
  - ドラフト作成
  - 既存リリースの確認

### ✅ E2Eテスト作成（tests/e2e/）

- [ ] テスト用リポジトリのセットアップ
  - サンプルコミット履歴の作成
  - テスト用タグの作成
  - テスト用PRとIssueの作成

- [ ] full-workflow.test.ts
  - タグプッシュから完了までの全フロー
  - 実際のファイル生成確認
  - 出力内容の検証

- [ ] dry-run.test.ts
  - ドライランモードの動作確認
  - ファイルが作成されないことを確認
  - プレビュー出力の確認

- [ ] error-scenarios.test.ts
  - 不正なタグ形式
  - GitHub Token権限不足
  - ファイル書き込み失敗
  - API呼び出し失敗

### ✅ カバレッジ向上

- [ ] 現在のカバレッジ確認
  ```bash
  npm run test:coverage
  ```
- [ ] 80%未満の箇所の特定
- [ ] 追加テストケース作成
- [ ] エッジケースのテスト追加
  - 空のリリース（変更なし）
  - 1000件以上のPR
  - 非常に長いコミットメッセージ

### ✅ README.md作成

- [ ] プロジェクト概要
  - 目的と機能の説明
  - 主な特徴のリスト
- [ ] インストール方法
  - GitHub Marketplaceからの利用
  - 直接リポジトリを参照する方法
- [ ] 基本的な使用方法
  - 最小限のワークフロー例
  - 必須パラメータの説明
- [ ] 設定オプション
  - inputs一覧表
    | Input | Description | Required | Default |
    |-------|-------------|----------|---------|
  - outputs一覧表
- [ ] 使用例
  - 基本的な例
  - カスタマイズ例
  - ドライラン例
  - プレリリース対応例
- [ ] トラブルシューティング
  - よくある問題と解決方法
  - エラーメッセージの説明
- [ ] 制約事項と注意点
- [ ] ライセンス情報
- [ ] コントリビューション方法

### ✅ CONTRIBUTING.md作成

- [ ] 開発環境のセットアップ手順
- [ ] ローカルでのテスト方法
- [ ] コーディング規約
  - TypeScript Style Guide
  - ESLint/Prettier設定
- [ ] プルリクエストのガイドライン
- [ ] コミットメッセージの規約（Conventional Commits）
- [ ] イシューの報告方法

### ✅ 使用例集作成（examples/）

- [ ] examples/basic-usage.yml
  - 最もシンプルな使用例
  - デフォルト設定のみ

- [ ] examples/custom-template.yml
  - テンプレート選択の例
  - Detailed、Minimalテンプレートの使用

- [ ] examples/with-exclusions.yml
  - 除外ラベルの設定
  - choreコミット除外の例

- [ ] examples/dry-run.yml
  - ドライランモードの使用例
  - リリース前のプレビュー

- [ ] examples/prerelease.yml
  - プレリリース対応の例
  - beta、rcバージョンの扱い

- [ ] examples/monorepo.yml（将来拡張用）
  - Monorepoでの使用例
  - 複数パッケージの管理

### ✅ API ドキュメント作成（docs/）

- [ ] docs/api.md
  - 各モジュールの説明
  - 主要な関数のシグネチャ
  - 型定義の説明

- [ ] docs/architecture.md
  - システムアーキテクチャ図
  - データフロー図
  - モジュール間の依存関係

- [ ] docs/templates.md
  - テンプレートの詳細仕様
  - カスタムテンプレートの作り方（将来拡張用）
  - テンプレート変数のリファレンス

### ✅ CI/CD設定

- [ ] .github/workflows/test.yml作成
  - プルリクエスト時の自動テスト
  - 複数Node.jsバージョンでのテスト（18.x, 20.x）
  - カバレッジレポートの生成

- [ ] .github/workflows/lint.yml作成
  - ESLintチェック
  - Prettierチェック
  - TypeScriptコンパイルチェック

- [ ] .github/workflows/release.yml作成
  - タグプッシュ時のリリース処理
  - dist/のビルド
  - GitHub Releaseの自動作成
  - **自アクションを使ったdogfooding**

### ✅ ドキュメント校正

- [ ] READMEの誤字脱字チェック
- [ ] リンク切れチェック
- [ ] サンプルコードの動作確認
- [ ] スクリーンショット追加（オプション）

## 完了条件

- [x] 全モジュールに対するユニットテストが存在する
- [x] コードカバレッジが80%以上である
- [x] E2Eテストが全フロー正常に動作する
- [x] README.mdが完全で分かりやすい
- [x] 最低3つの実用的な使用例が提供されている
- [x] CONTRIBUTING.mdに開発手順が明記されている
- [x] CI/CDが正常に動作し、テストが自動実行される
- [x] 全てのドキュメントにリンク切れがない

## メモ

### テストディレクトリ構成
```
tests/
├── unit/
│   ├── utils.test.ts
│   ├── parser.test.ts
│   ├── categorizer.test.ts
│   ├── filter.test.ts
│   ├── contributors.test.ts
│   ├── validator.test.ts
│   └── templates/
│       ├── standard.test.ts
│       ├── detailed.test.ts
│       └── minimal.test.ts
├── integration/
│   ├── collector.integration.test.ts
│   ├── writer.integration.test.ts
│   └── releases.integration.test.ts
├── e2e/
│   ├── full-workflow.test.ts
│   ├── dry-run.test.ts
│   └── error-scenarios.test.ts
└── fixtures/
    ├── sample-commits.json
    ├── sample-prs.json
    └── sample-issues.json
```

### テスト例
```typescript
// utils.test.ts
import { isValidSemver } from '../src/utils';

describe('isValidSemver', () => {
  test('valid versions', () => {
    expect(isValidSemver('v1.0.0')).toBe(true);
    expect(isValidSemver('v2.3.5')).toBe(true);
    expect(isValidSemver('v1.0.0-beta.1')).toBe(true);
  });

  test('invalid versions', () => {
    expect(isValidSemver('1.0.0')).toBe(false);
    expect(isValidSemver('version-1.0.0')).toBe(false);
    expect(isValidSemver('invalid')).toBe(false);
  });
});
```

### CI/CDワークフロー例
```yaml
name: Test

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
      - uses: codecov/codecov-action@v3
        if: matrix.node-version == '20.x'
```

### README バッジ例
```markdown
![Test](https://github.com/your-username/auto-release-notes/workflows/Test/badge.svg)
![Coverage](https://codecov.io/gh/your-username/auto-release-notes/branch/main/graph/badge.svg)
![License](https://img.shields.io/github/license/your-username/auto-release-notes)
```

### 参考リンク
- [Jest Testing Framework](https://jestjs.io/)
- [GitHub Actions Testing](https://github.com/actions/toolkit/blob/main/docs/action-debugging.md)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
