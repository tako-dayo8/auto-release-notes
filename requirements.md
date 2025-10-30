# GitHub自動リリースノート作成アクション 要件定義書

## 1. プロジェクト概要

### 1.1 目的
GitHub Workflowで動作するカスタムアクションを開発し、タグプッシュ時に自動的にリリースノートを生成・管理する仕組みを構築する。

### 1.2 背景
- リリースノート作成の手動作業を削減
- リリース情報の標準化と品質向上
- チーム内でのリリース履歴の可視化

### 1.3 スコープ
- TypeScriptベースのGitHub Custom Actionの開発
- Semantic Versioningに準拠したバージョン管理
- 複数の情報源からのリリースノート自動生成
- 複数の出力形式への対応

---

## 2. 機能要件

### 2.1 トリガー条件

#### 2.1.1 基本トリガー
- **イベント**: タグプッシュ（`push` with `tags`）
- **タグ形式**: Semantic Versioning準拠（例: `v1.2.3`, `v0.1.0-beta.1`）
- **バリデーション**:
  - タグが `v` で始まること
  - Major.Minor.Patch の形式に従うこと
  - プレリリース識別子（alpha, beta, rc）のサポート

#### 2.1.2 タグパターン例
```
✓ v1.0.0
✓ v2.3.5
✓ v1.0.0-beta.1
✓ v2.0.0-rc.1
✗ 1.0.0 (v prefix なし)
✗ version-1.0.0 (形式不一致)
```

### 2.2 情報収集

#### 2.2.1 情報源
以下の3つのソースから情報を収集:

1. **Pull Request**
   - タイトル
   - 本文（説明）
   - ラベル
   - マージ日時
   - 作成者

2. **コミットメッセージ**
   - Conventional Commits形式の解析
   - コミットハッシュ
   - コミット日時
   - コミッター

3. **Issue**
   - PRでクローズされたIssue
   - Issue番号とタイトル
   - ラベル

#### 2.2.2 収集対象範囲
- 前回のタグから今回のタグまでの全変更
- 初回リリース（タグなし）の場合は全履歴

### 2.3 カテゴリ分類

#### 2.3.1 分類方法
2つの方式をサポート（優先順位付き）:

1. **Conventional Commits（優先）**
   ```
   feat: 新機能
   fix: バグ修正
   docs: ドキュメント
   style: コードスタイル
   refactor: リファクタリング
   perf: パフォーマンス改善
   test: テスト
   build: ビルドシステム
   ci: CI/CD
   chore: その他の作業
   ```

2. **GitHubラベル（補助）**
   - PRにConventional Commitsがない場合にラベルを参照
   - ラベルとカテゴリのマッピング:
     - `feature`, `enhancement` → 新機能
     - `bug`, `bugfix` → バグ修正
     - `documentation` → ドキュメント
     - `performance` → パフォーマンス改善

#### 2.3.2 デフォルトカテゴリ
以下の順序でカテゴリを表示:
1. 🚨 Breaking Changes（破壊的変更）
2. ✨ Features（新機能）
3. 🐛 Bug Fixes（バグ修正）
4. 📚 Documentation（ドキュメント）
5. ⚡ Performance（パフォーマンス改善）
6. 🔧 Refactoring（リファクタリング）
7. 🎨 Style（スタイル）
8. ✅ Tests（テスト）
9. 🔨 Build System（ビルド）
10. 🤖 CI/CD
11. 📦 Other Changes（その他）

### 2.4 除外設定

#### 2.4.1 除外対象
以下の変更をリリースノートから除外:

1. **choreコミット**
   - パターン: `^chore:`、`^chore(.*?):`
   - 例: `chore: update dependencies`

2. **特定ラベルのPR**
   - ラベル: `skip-changelog`, `no-changelog`
   - PRにこれらのラベルが付いている場合は除外

3. **マージコミット（オプション）**
   - パターン: `^Merge branch`、`^Merge pull request`
   - 設定で有効化可能

### 2.5 追加情報

#### 2.5.1 コントリビューター表示
- 変更に貢献した全ユーザーをリスト化
- GitHub username形式で表示（`@username`）
- 重複排除
- アルファベット順にソート

#### 2.5.2 その他の情報（推奨）
- リリース日時
- 前バージョンとの比較リンク
- 関連Issue番号の自動リンク化

### 2.6 出力形式

#### 2.6.1 出力先
複数の出力先をサポート:

1. **CHANGELOG.md（ルートディレクトリ）**
   - 全バージョンの履歴を蓄積
   - 新しいバージョンを先頭に追記
   - Keep a Changelog形式に準拠

2. **changelog/x.x.x.md（個別ファイル）**
   - 各バージョンごとに独立したファイル
   - ディレクトリ構造: `changelog/1.0.0.md`, `changelog/2.0.0.md`
   - より詳細な情報を含む

3. **GitHub Releases（推奨）**
   - GitHub Releases APIを使用して自動公開
   - CHANGELOG.mdと同じ内容を投稿
   - リリースアセット添付のサポート（オプション）

#### 2.6.2 テンプレートプリセット
以下の3つのプリセットを提供:

1. **Standard（標準）**
   ```markdown
   ## [1.0.0] - 2025-01-15

   ### ✨ Features
   - Add user authentication (#123) @username
   - Implement dark mode (#125) @username

   ### 🐛 Bug Fixes
   - Fix login redirect issue (#124) @username

   ### Contributors
   @username1, @username2

   **Full Changelog**: https://github.com/owner/repo/compare/v0.9.0...v1.0.0
   ```

2. **Detailed（詳細）**
   - PR番号、Issue番号、コミットハッシュを含む
   - コントリビューターごとの貢献サマリー
   - 統計情報（追加/削除行数）

3. **Minimal（最小）**
   - カテゴリなし
   - 変更内容を箇条書きのみ
   - シンプルで軽量

---

## 3. 技術要件

### 3.1 開発環境

#### 3.1.1 言語とランタイム
- **言語**: TypeScript 5.x
- **ランタイム**: Node.js 20.x
- **パッケージマネージャー**: npm または pnpm

#### 3.1.2 主要依存ライブラリ
```json
{
  "@actions/core": "^1.10.0",
  "@actions/github": "^6.0.0",
  "@octokit/rest": "^20.0.0",
  "conventional-commits-parser": "^5.0.0"
}
```

### 3.2 GitHub Action仕様

#### 3.2.1 Action定義（action.yml）
```yaml
name: 'Auto Release Notes Generator'
description: 'Automatically generates release notes from PRs, commits, and issues'
author: 'Your Name'

inputs:
  github-token:
    description: 'GitHub token for API access'
    required: true
    default: ${{ github.token }}

  template:
    description: 'Template preset: standard, detailed, minimal'
    required: false
    default: 'standard'

  changelog-file:
    description: 'Path to CHANGELOG.md file'
    required: false
    default: 'CHANGELOG.md'

  version-file:
    description: 'Enable individual version files in changelog/ directory'
    required: false
    default: 'true'

  create-github-release:
    description: 'Create GitHub Release'
    required: false
    default: 'true'

  exclude-labels:
    description: 'Comma-separated list of labels to exclude'
    required: false
    default: 'skip-changelog,no-changelog'

  dry-run:
    description: 'Run without making any changes'
    required: false
    default: 'false'

outputs:
  release-notes:
    description: 'Generated release notes content'

  version:
    description: 'Detected version from tag'

  changelog-url:
    description: 'URL to the created GitHub Release (if applicable)'

runs:
  using: 'node20'
  main: 'dist/index.js'
```

### 3.3 エラーハンドリング

#### 3.3.1 バリデーション
- タグ形式の検証（Semantic Versioningチェック）
- GitHub token権限の確認
- ファイルパスの存在確認
- 入力パラメータの型チェック

#### 3.3.2 エラー時の動作
- **タグ形式不正**: エラーメッセージを出力して終了（exit code 1）
- **API呼び出し失敗**: 最大3回リトライ（指数バックオフ）
- **ファイル書き込み失敗**: エラーログを出力して終了
- **変更なし**: 警告ログのみ（エラーにしない）

#### 3.3.3 ドライランモード
- `dry-run: true`設定時の動作:
  - 全ての処理を実行（API呼び出しも含む）
  - ファイル書き込みとGitHub Release作成のみスキップ
  - 生成されたリリースノートをログ出力
  - 変更予定のファイルパスを表示

### 3.4 ログ出力

#### 3.4.1 ログレベル
```typescript
// 詳細ログ例
info: Detected version: v1.0.0
info: Fetching PRs from v0.9.0 to v1.0.0...
info: Found 15 PRs, 45 commits, 8 closed issues
info: Categorizing changes...
info: ✨ Features: 5 items
info: 🐛 Bug Fixes: 3 items
info: Excluding 2 PRs with skip-changelog label
info: Writing to CHANGELOG.md...
info: Creating GitHub Release...
success: Release notes generated successfully!
```

#### 3.4.2 デバッグモード
- `ACTIONS_STEP_DEBUG=true` 環境変数でデバッグログ有効化
- API レスポンスの詳細
- パース済みコミット情報
- カテゴリ分類の詳細

### 3.5 パフォーマンス要件

- **実行時間**: 通常ケースで30秒以内
- **API呼び出し**: GitHub API rate limitに配慮（ページネーション対応）
- **大規模リポジトリ**: 1000件以上のPR/コミットでも動作

---

## 4. 非機能要件

### 4.1 セキュリティ
- GitHub tokenは環境変数から取得（ハードコード禁止）
- 依存ライブラリの脆弱性チェック（Dependabot有効化）
- 最小権限の原則（必要な権限のみ要求）

### 4.2 メンテナンス性
- TypeScriptによる型安全性
- ユニットテスト（カバレッジ80%以上）
- ESLint/Prettierによるコード品質管理
- 明確なコメントとドキュメント

### 4.3 互換性
- GitHub Actions v3/v4互換
- セルフホストランナーでも動作
- GitHub Enterprise Serverサポート（v3.8以降）

---

## 5. 使用例

### 5.1 基本的な使用方法

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: read
      issues: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 全履歴を取得

      - name: Generate Release Notes
        uses: your-username/auto-release-notes@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          template: standard
          create-github-release: true
```

### 5.2 カスタマイズ例

```yaml
      - name: Generate Release Notes
        uses: your-username/auto-release-notes@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          template: detailed
          changelog-file: docs/CHANGELOG.md
          version-file: true
          exclude-labels: skip-changelog,internal
          dry-run: false
```

### 5.3 ドライラン例

```yaml
      - name: Preview Release Notes
        uses: your-username/auto-release-notes@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          dry-run: true
```

---

## 6. 成果物

### 6.1 開発物
1. **ソースコード**
   - `src/main.ts`: エントリーポイント
   - `src/generator.ts`: リリースノート生成ロジック
   - `src/collector.ts`: 情報収集ロジック
   - `src/categorizer.ts`: カテゴリ分類ロジック
   - `src/writer.ts`: ファイル書き込みロジック
   - `src/templates/`: テンプレートファイル

2. **設定ファイル**
   - `action.yml`: Action定義
   - `package.json`: 依存関係
   - `tsconfig.json`: TypeScript設定
   - `.eslintrc.js`: Lint設定

3. **テストコード**
   - `tests/`: ユニットテスト
   - `e2e/`: E2Eテスト

### 6.2 ドキュメント
1. **README.md**: 使用方法、設定オプション
2. **CONTRIBUTING.md**: 開発ガイドライン
3. **examples/**: 使用例

---

## 7. スケジュールと優先度

### 7.1 開発フェーズ

#### Phase 1: コア機能（必須）
- [ ] プロジェクトセットアップ
- [ ] 情報収集機能（PR/Commit/Issue）
- [ ] Conventional Commits解析
- [ ] 基本的なカテゴリ分類
- [ ] CHANGELOG.md出力

#### Phase 2: 拡張機能（必須）
- [ ] GitHubラベル対応
- [ ] 除外設定（chore、ラベル）
- [ ] コントリビューター表示
- [ ] 個別バージョンファイル出力
- [ ] GitHub Releases作成

#### Phase 3: 高度な機能（推奨）
- [ ] 複数テンプレートプリセット
- [ ] ドライランモード
- [ ] リトライロジック
- [ ] 詳細ログ出力
- [ ] バリデーション強化

#### Phase 4: テスト・ドキュメント（必須）
- [ ] ユニットテスト作成
- [ ] E2Eテスト作成
- [ ] README作成
- [ ] 使用例の作成

---

## 8. 制約事項

### 8.1 技術的制約
- GitHub APIのrate limit（認証済み: 5000 requests/hour）
- Node.js 20.x以上が必要
- git履歴全体へのアクセスが必要（`fetch-depth: 0`）

### 8.2 機能的制約
- Conventional Commits形式以外のコミットは正確に分類できない可能性
- プライベートリポジトリではGitHub tokenに適切な権限が必要
- 大量のPR/コミット（1000件超）では処理時間が増加

---

## 9. 今後の拡張案

### 9.1 検討事項
- [ ] AI（GPT-4）を使った要約生成
- [ ] Slack/Discord通知機能
- [ ] 多言語対応（英語/日本語）
- [ ] カスタムテンプレート（Handlebars/Mustache）
- [ ] Breaking Changesの自動検出強化
- [ ] 統計情報（追加/削除行数、ファイル数）
- [ ] Monorepo対応（複数パッケージ）

---

## 10. 承認

### 10.1 要件確認
- [ ] 機能要件の確認
- [ ] 技術要件の確認
- [ ] スケジュールの確認

### 10.2 承認者
| 役割 | 氏名 | 日付 | 署名 |
|-----|-----|------|-----|
| プロジェクトオーナー | | | |
| 開発リーダー | | | |

---

## 変更履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|----------|------|---------|-------|
| 1.0 | 2025-01-31 | 初版作成 | Claude |

---

**注意事項**:
この要件定義書は初版であり、開発中に変更される可能性があります。重要な変更がある場合は、関係者への通知と承認が必要です。
