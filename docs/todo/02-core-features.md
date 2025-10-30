# TODO: コア機能実装

作成日: 2025-01-31
ステータス: 🔴 未着手

## 概要

リリースノート生成の核となる機能を実装します。GitHub APIを使用してPR、コミット、Issueの情報を収集し、Conventional Commits形式を解析して基本的なカテゴリ分類を行い、CHANGELOG.mdへの出力機能を構築します。

## タスク一覧

### ✅ 情報収集機能（collector.ts）

- [ ] GitHubクライアントの初期化
  - Octokitインスタンスの作成
  - トークン認証の実装
- [ ] タグ情報取得機能
  - 最新タグの取得
  - 前回タグの取得
  - タグ間のコミット範囲特定
- [ ] Pull Request情報収集
  - マージ済みPRのリスト取得
  - PRタイトル、本文、ラベル、作成者の取得
  - ページネーション対応（100件以上のPR）
- [ ] コミット情報収集
  - タグ間のコミット履歴取得
  - コミットメッセージ、ハッシュ、作成者の取得
  - マージコミットの識別
- [ ] Issue情報収集
  - PRでクローズされたIssueの取得
  - Issue番号とタイトルの抽出

### ✅ Conventional Commits解析（parser.ts）

- [ ] conventional-commits-parserライブラリの統合
- [ ] コミットメッセージのパース
  - type（feat, fix, docs等）の抽出
  - scope（オプション）の抽出
  - subject（説明）の抽出
  - body（詳細）の抽出
  - footer（Breaking Changes等）の抽出
- [ ] Breaking Changes検出
  - BREAKING CHANGE:の検出
  - !マーク付きコミットの検出
- [ ] パース結果の型定義
  ```typescript
  interface ParsedCommit {
    type: string;
    scope?: string;
    subject: string;
    body?: string;
    breaking: boolean;
    hash: string;
    author: string;
  }
  ```

### ✅ カテゴリ分類機能（categorizer.ts）

- [ ] Conventional Commitsタイプのマッピング
  - feat → ✨ Features
  - fix → 🐛 Bug Fixes
  - docs → 📚 Documentation
  - style → 🎨 Style
  - refactor → 🔧 Refactoring
  - perf → ⚡ Performance
  - test → ✅ Tests
  - build → 🔨 Build System
  - ci → 🤖 CI/CD
  - chore → その他（後で除外可能）
- [ ] Breaking Changes専用カテゴリの作成
- [ ] カテゴリごとのアイテムリスト作成
- [ ] カテゴリの表示順序管理
- [ ] 分類結果の型定義
  ```typescript
  interface CategorizedChanges {
    breaking: ChangeItem[];
    features: ChangeItem[];
    bugFixes: ChangeItem[];
    documentation: ChangeItem[];
    performance: ChangeItem[];
    refactoring: ChangeItem[];
    style: ChangeItem[];
    tests: ChangeItem[];
    build: ChangeItem[];
    ci: ChangeItem[];
    other: ChangeItem[];
  }
  ```

### ✅ CHANGELOG.md出力機能（writer.ts）

- [ ] テンプレート生成機能
  - バージョン番号セクションの生成
  - 日付の追加（YYYY-MM-DD形式）
  - カテゴリセクションの生成
- [ ] 変更項目のフォーマット
  - 箇条書き形式（`- `）
  - PR番号のリンク化（#123）
  - 作成者の表示（@username）
- [ ] ファイル読み込み機能
  - 既存のCHANGELOG.mdの読み込み
  - ファイルが存在しない場合の初期化
- [ ] ファイル書き込み機能
  - 新しいバージョンを先頭に追記
  - 既存内容の保持
  - ファイルのバックアップ（オプション）
- [ ] 出力フォーマット例
  ```markdown
  ## [1.0.0] - 2025-01-31

  ### ✨ Features
  - Add user authentication (#123) @username
  - Implement dark mode (#125) @username

  ### 🐛 Bug Fixes
  - Fix login redirect issue (#124) @username
  ```

### ✅ メイン処理統合（main.ts）

- [ ] アクション入力の取得
  - github-tokenの取得
  - その他のinputsの取得
- [ ] バージョン検出
  - タグ名からバージョン抽出
  - Semantic Versioning形式の検証
- [ ] 処理フローの実装
  1. タグ情報の取得
  2. 変更情報の収集
  3. コミットの解析
  4. カテゴリ分類
  5. CHANGELOG生成
  6. ファイル書き込み
- [ ] エラーハンドリング
  - try-catchブロックの実装
  - エラーメッセージの出力（@actions/core.setFailed）
- [ ] 成功時の出力
  - release-notesのセット
  - versionのセット

### ✅ ユーティリティ関数（utils.ts）

- [ ] バージョン番号の検証関数
  ```typescript
  function isValidSemver(version: string): boolean
  ```
- [ ] タグ名からバージョン抽出
  ```typescript
  function extractVersion(tag: string): string
  ```
- [ ] 日付フォーマット関数
  ```typescript
  function formatDate(date: Date): string // YYYY-MM-DD
  ```
- [ ] GitHub URLパース
  ```typescript
  function parseRepoUrl(url: string): { owner: string; repo: string }
  ```

## 完了条件

- [x] GitHub APIから正常にPR、コミット、Issue情報を取得できる
- [x] Conventional Commits形式のコミットメッセージを正しく解析できる
- [x] 変更内容が適切なカテゴリに分類される
- [x] CHANGELOG.mdが正しいフォーマットで生成される
- [x] 既存のCHANGELOG.mdに新しいバージョンが追記される
- [x] Breaking Changesが正しく検出され、専用セクションに表示される
- [x] エラー発生時に適切なエラーメッセージが出力される

## メモ

### ファイル構成
```
src/
├── main.ts           # エントリーポイント
├── collector.ts      # 情報収集
├── parser.ts         # Conventional Commits解析
├── categorizer.ts    # カテゴリ分類
├── writer.ts         # ファイル出力
└── utils.ts          # ユーティリティ関数
```

### GitHub API使用例
```typescript
import { getOctokit } from '@actions/github';

const octokit = getOctokit(token);
const { data: pulls } = await octokit.rest.pulls.list({
  owner,
  repo,
  state: 'closed',
  base: 'main',
  per_page: 100,
});
```

### Conventional Commits解析例
```typescript
import parser from 'conventional-commits-parser';

const parsed = parser.sync('feat(auth): add OAuth support\n\nBREAKING CHANGE: remove basic auth');
// { type: 'feat', scope: 'auth', subject: 'add OAuth support', breaking: true }
```

### 参考リンク
- [Octokit REST API](https://octokit.github.io/rest.js/)
- [Conventional Commits Parser](https://github.com/conventional-changelog/conventional-changelog)
- [Keep a Changelog](https://keepachangelog.com/)
