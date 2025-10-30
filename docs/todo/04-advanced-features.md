# TODO: 高度な機能実装

作成日: 2025-01-31
ステータス: 🟡 進行中

## 概要

複数テンプレートプリセット、ドライランモード、リトライロジック、詳細ログ出力、バリデーション強化などの高度な機能を実装します。これによりアクションの信頼性、柔軟性、デバッグ性を向上させます。

## タスク一覧

### ✅ 複数テンプレートプリセット（templates/）

- [ ] テンプレートディレクトリの作成
  ```
  src/templates/
  ├── standard.ts
  ├── detailed.ts
  └── minimal.ts
  ```
- [ ] Standardテンプレート実装
  - カテゴリごとのセクション
  - PR番号と作成者表示
  - コントリビューターリスト
  - 比較リンク
- [ ] Detailedテンプレート実装
  - Standardの内容に加えて
  - コミットハッシュ表示
  - Issue番号の明示
  - 統計情報（変更ファイル数、追加/削除行数）
  - コントリビューターごとの貢献サマリー
- [ ] Minimalテンプレート実装
  - カテゴリなし
  - 変更内容を箇条書きのみ
  - PR番号のみ（作成者なし）
  - シンプルで軽量
- [ ] テンプレート選択機能
  - inputs.templateから取得
  - デフォルト: standard
  - 不正な値の場合はエラー
- [ ] テンプレートインターフェース定義
  ```typescript
  interface Template {
    generate(data: ReleaseData): string;
    formatChangeItem(item: ChangeItem): string;
    formatCategory(category: string, items: ChangeItem[]): string;
  }
  ```

### ✅ ドライランモード（dryrun.ts新規作成）

- [ ] ドライラン設定の読み込み
  - inputs.dry-runから取得
  - デフォルト: false
- [ ] ドライラン時の動作制御
  - 情報収集: 実行
  - 解析・分類: 実行
  - リリースノート生成: 実行
  - ファイル書き込み: **スキップ**
  - GitHub Release作成: **スキップ**
- [ ] プレビュー出力機能
  ```
  info: [DRY RUN] Generated release notes:
  ----------------------------------------
  ## [1.0.0] - 2025-01-31

  ### ✨ Features
  - Add feature X (#123) @alice
  ...
  ----------------------------------------
  info: [DRY RUN] Would write to: CHANGELOG.md
  info: [DRY RUN] Would write to: changelog/1.0.0.md
  info: [DRY RUN] Would create GitHub Release: v1.0.0
  ```
- [ ] ドライラン専用ログ接頭辞
  - すべての操作に`[DRY RUN]`を付与
- [ ] 変更予定ファイルのリスト表示

### ✅ リトライロジック（retry.ts新規作成）

- [ ] リトライ可能な処理の識別
  - GitHub API呼び出し
  - ファイル書き込み
  - GitHub Release作成
- [ ] リトライ設定
  - 最大リトライ回数: 3回
  - 初期待機時間: 1秒
  - 指数バックオフ: 2倍ずつ増加
  - 最大待機時間: 10秒
- [ ] リトライ実装
  ```typescript
  async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const delay = Math.min(initialDelay * Math.pow(2, i), 10000);
        await sleep(delay);
      }
    }
    throw lastError;
  }
  ```
- [ ] リトライログ出力
  ```
  warning: API call failed, retrying (attempt 1/3)...
  warning: API call failed, retrying (attempt 2/3)...
  error: API call failed after 3 attempts
  ```
- [ ] リトライ不可能なエラーの判定
  - 認証エラー (401): リトライしない
  - 権限エラー (403): リトライしない
  - Not Found (404): リトライしない
  - Rate Limit (429): リトライする（待機時間を延長）

### ✅ 詳細ログ出力（logger.ts新規作成）

- [ ] ログレベルの定義
  - debug: デバッグ情報
  - info: 通常の情報
  - warning: 警告
  - error: エラー
  - success: 成功メッセージ
- [ ] ログ出力関数の実装
  ```typescript
  import * as core from '@actions/core';

  export function debug(message: string): void {
    core.debug(message);
  }

  export function info(message: string): void {
    core.info(message);
  }

  export function warning(message: string): void {
    core.warning(message);
  }

  export function error(message: string): void {
    core.error(message);
  }
  ```
- [ ] 処理段階ごとのログ
  - 開始時: "Starting release notes generation..."
  - タグ検出: "Detected version: v1.0.0"
  - 情報収集: "Fetching PRs from v0.9.0 to v1.0.0..."
  - 統計: "Found 15 PRs, 45 commits, 8 closed issues"
  - カテゴリ分類: "✨ Features: 5 items"
  - 除外: "Excluding 2 PRs with skip-changelog label"
  - ファイル書き込み: "Writing to CHANGELOG.md..."
  - 完了: "Release notes generated successfully!"
- [ ] デバッグモード対応
  - ACTIONS_STEP_DEBUG=true時に詳細ログ
  - APIレスポンスの出力
  - パース済みデータの出力
- [ ] 進捗インジケーター（オプション）
  ```
  info: [1/5] Collecting changes...
  info: [2/5] Parsing commits...
  info: [3/5] Categorizing changes...
  info: [4/5] Generating release notes...
  info: [5/5] Writing files...
  ```

### ✅ バリデーション強化（validator.ts新規作成）

- [ ] タグ形式バリデーション
  - Semantic Versioning形式チェック
  - 正規表現: `^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$`
  - エラーメッセージ: "Invalid tag format: {tag}. Expected Semantic Versioning (e.g., v1.2.3)"
- [ ] GitHub Token権限チェック
  - contents:write権限の確認
  - pull-requests:read権限の確認
  - issues:read権限の確認
  - 権限不足時の明確なエラーメッセージ
- [ ] 入力パラメータ検証
  - template値の検証（standard, detailed, minimal以外はエラー）
  - dry-runのboolean検証
  - exclude-labelsの形式検証
- [ ] ファイルパスバリデーション
  - changelog-fileが有効なパスか確認
  - 書き込み権限の確認
  - ディレクトリが存在しない場合は作成を試みる
- [ ] リポジトリ状態の確認
  - .gitディレクトリの存在確認
  - タグの存在確認
  - 前回タグの存在確認（初回リリースの場合は許容）
- [ ] 事前検証レポート
  ```
  info: ✓ Valid Semantic Versioning tag: v1.0.0
  info: ✓ GitHub token has required permissions
  info: ✓ Template 'standard' is valid
  info: ✓ CHANGELOG.md is writable
  info: ✓ Previous tag found: v0.9.0
  ```

### ✅ エラーハンドリング改善（main.ts拡張）

- [ ] 詳細なエラーメッセージ
  - エラーの種類を明示
  - 解決方法の提示
- [ ] スタックトレース出力（デバッグモード時）
- [ ] エラー発生時のクリーンアップ
  - 一時ファイルの削除
  - 不完全なファイルの削除
- [ ] グレースフルな終了
  - 部分的な成功でも利用可能な情報を出力

### ✅ パフォーマンス最適化

- [ ] API呼び出しの並列化
  - PRとIssueを並列取得
  - Promise.allの活用
- [ ] ページネーション効率化
  - per_page: 100に設定
  - 必要な範囲のみ取得
- [ ] キャッシュ機構（オプション）
  - 同じデータの重複取得を防止
- [ ] 処理時間の計測とログ出力
  ```
  info: Processing completed in 12.3 seconds
  ```

## 完了条件

- [x] 3つのテンプレート（Standard, Detailed, Minimal）が正しく動作する
- [x] ドライランモードで実際の変更なしにプレビューが表示される
- [x] API呼び出し失敗時に最大3回リトライされる
- [x] 詳細なログが適切なタイミングで出力される
- [x] デバッグモード（ACTIONS_STEP_DEBUG=true）で詳細情報が表示される
- [x] 入力パラメータとタグ形式が正しく検証される
- [x] GitHub Token権限不足時に明確なエラーが表示される
- [x] エラー発生時に適切なエラーメッセージと解決方法が提示される
- [x] 大規模リポジトリ（1000+ PRs）でも30秒以内に処理完了する

## メモ

### 最終的なファイル構成
```
src/
├── main.ts
├── collector.ts
├── parser.ts
├── categorizer.ts
├── filter.ts
├── contributors.ts
├── writer.ts
├── releases.ts
├── formatter.ts
├── utils.ts
├── dryrun.ts          # 新規: ドライラン
├── retry.ts           # 新規: リトライ
├── logger.ts          # 新規: ログ
├── validator.ts       # 新規: バリデーション
└── templates/         # 新規: テンプレート
    ├── standard.ts
    ├── detailed.ts
    └── minimal.ts
```

### テンプレート出力例（Detailed）
```markdown
## [1.0.0] - 2025-01-31

### 📊 Statistics
- 15 pull requests
- 45 commits
- 8 issues closed
- 3 contributors

### 🚨 Breaking Changes
- Remove deprecated API endpoints (#120) @alice
  - Commit: a1b2c3d
  - Migration guide in docs/migration.md

### ✨ Features (5)
- Add user authentication (#123) @alice
  - Commit: d4e5f6g
  - Closes: #100, #105
...

### 👥 Contributors
This release was made possible by:
- @alice (8 PRs)
- @bob (5 PRs)
- @charlie (2 PRs)
```

### バリデーションエラー例
```
Error: Invalid tag format: 'release-1.0.0'
Expected Semantic Versioning format (e.g., v1.2.3)
Please use tags like: v1.0.0, v2.1.3-beta.1

Error: GitHub token missing required permissions
Required: contents:write, pull-requests:read, issues:read
Please update your workflow permissions or use a personal access token.
```

### 参考リンク
- [GitHub Actions Toolkit - Core](https://github.com/actions/toolkit/tree/main/packages/core)
- [Exponential Backoff](https://en.wikipedia.org/wiki/Exponential_backoff)
- [Semantic Versioning](https://semver.org/)
