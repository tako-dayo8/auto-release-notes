# Auto Release Notes Generator

新しいタグをプッシュした際に、PR・コミット・Issueから自動的にリリースノートを生成するTypeScriptベースのGitHub Actionです。Conventional Commits、複数の出力テンプレート、GitHub Releasesとのシームレスな連携をサポートしています。

[![Test](https://github.com/tako-dayo8/auto-release-notes/workflows/Test/badge.svg)](https://github.com/tako-dayo8/auto-release-notes/actions)
[![Coverage](https://img.shields.io/badge/coverage-99%25-brightgreen)](https://github.com/tako-dayo8/auto-release-notes)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[English](./README.md) | 日本語

## 機能

- **自動リリースノート生成**: Git履歴から構造化されたリリースノートを自動生成
- **Conventional Commitsサポート**: [Conventional Commits](https://www.conventionalcommits.org/)仕様に準拠したコミットメッセージを解析
- **GitHubラベルによるフォールバック**: コミット形式が規約に沿っていない場合、PRラベルでカテゴリ分類
- **複数のテンプレート**: Standard、Detailed、Minimalの出力形式から選択可能
- **スマートフィルタリング**: choreコミットや特定ラベルのPRを自動除外
- **Breaking Changes検出**: 破壊的変更を自動識別してハイライト表示
- **コントリビューターリスト**: ソート済みのコントリビューターリストを生成（Bot除外）
- **GitHub Releases連携**: GitHub Releasesへの自動投稿に対応
- **ドライランモード**: 変更を加えずにリリースノートをプレビュー
- **リトライロジック**: 指数バックオフを使用したGitHub API呼び出しの自動リトライ

## インストール

### GitHub Marketplaceから

*(近日公開)*

### 直接参照

ワークフローでこのリポジトリを参照してアクションを追加：

```yaml
- uses: tako-dayo8/auto-release-notes@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 使い方

### 基本的な例

ワークフローファイルを作成（例: `.github/workflows/release.yml`）：

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
          fetch-depth: 0  # 全Git履歴の取得に必要

      - name: Generate Release Notes
        uses: tako-dayo8/auto-release-notes@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          template: standard
          create-github-release: true
```

### 高度な例

```yaml
- name: Generate Release Notes
  uses: tako-dayo8/auto-release-notes@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    template: detailed
    changelog-file: docs/CHANGELOG.md
    version-file: true
    create-github-release: true
    exclude-labels: skip-changelog,internal,wip
    dry-run: false
```

## 入力パラメータ

| 入力 | 説明 | 必須 | デフォルト |
|------|------|------|-----------|
| `github-token` | GitHub API アクセス用トークン | Yes | `${{ github.token }}` |
| `template` | テンプレートプリセット: `standard`, `detailed`, `minimal` | No | `standard` |
| `changelog-file` | CHANGELOG.mdファイルのパス | No | `CHANGELOG.md` |
| `version-file` | `changelog/`ディレクトリに個別バージョンファイルを作成 | No | `true` |
| `create-github-release` | GitHub Releaseを作成 | No | `true` |
| `exclude-labels` | changelogから除外するラベル（カンマ区切り） | No | `skip-changelog,no-changelog` |
| `dry-run` | 変更を加えずに実行（プレビューモード） | No | `false` |

## 出力パラメータ

| 出力 | 説明 |
|------|------|
| `release-notes` | 生成されたリリースノートの内容（Markdown形式） |
| `version` | プッシュされたタグから検出されたバージョン |
| `changelog-url` | 作成されたGitHub ReleaseのURL（該当する場合） |

## テンプレート

### Standard（デフォルト）

絵文字アイコンとカテゴリセクションを使った、きれいに整理された形式：

```markdown
## [1.0.0] - 2025-01-31

### ✨ Features
- Add user authentication (#123) @alice
- Implement dark mode (#125) @bob

### 🐛 Bug Fixes
- Fix login redirect issue (#124) @charlie

### Contributors
@alice, @bob, @charlie

**Full Changelog**: https://github.com/owner/repo/compare/v0.9.0...v1.0.0
```

### Detailed（詳細）

コミットハッシュ、Issue番号、コントリビューター統計を含む：

```markdown
## [1.0.0] - 2025-01-31

### 📊 Statistics
- 15 pull requests
- 45 commits
- 8 issues closed
- 3 contributors

### ✨ Features
- Add user authentication (#123) @alice
  - Commit: d4e5f6g
  - Closes: #100, #105

### 👥 Contributors
This release was made possible by:
- @alice (8 PRs)
- @bob (5 PRs)
- @charlie (2 PRs)
```

### Minimal（最小）

カテゴリなしのシンプルな形式：

```markdown
## 1.0.0

- Add user authentication (#123)
- Implement dark mode (#125)
- Fix login redirect issue (#124)
```

## カテゴリ分類

変更は以下に基づいて自動的にカテゴリ分類されます：

1. **Conventional Commits**（優先）:
   - `feat:` → ✨ Features（新機能）
   - `fix:` → 🐛 Bug Fixes（バグ修正）
   - `docs:` → 📚 Documentation（ドキュメント）
   - `perf:` → ⚡ Performance（パフォーマンス）
   - `refactor:` → 🔧 Refactoring（リファクタリング）
   - `style:` → 🎨 Style（スタイル）
   - `test:` → ✅ Tests（テスト）
   - `build:` → 🔨 Build System（ビルドシステム）
   - `ci:` → 🤖 CI/CD
   - `chore:` → デフォルトで除外

2. **GitHubラベル**（フォールバック）:
   - `feature`, `enhancement` → Features
   - `bug`, `bugfix` → Bug Fixes
   - `documentation` → Documentation
   - `performance` → Performance
   - `breaking-change` → Breaking Changes

## Breaking Changes（破壊的変更）

破壊的変更は以下の方法で検出されます：

1. Conventional Commitsのフッター：
   ```
   feat: update authentication

   BREAKING CHANGE: remove basic auth support
   ```

2. タイプに`!`サフィックス：
   ```
   feat!: breaking feature
   ```

3. GitHubラベル：
   - PRに`breaking-change`ラベル

## フィルタリング

以下は自動的にリリースノートから除外されます：

- **Choreコミット**: `chore:`プレフィックスを持つコミット
- **ラベル付きPR**: `skip-changelog`または`no-changelog`ラベルを持つPR（設定可能）
- **Botアカウント**: dependabot、renovate、github-actionsなどの貢献

## 必要な権限

ワークフローには以下の権限が必要です：

```yaml
permissions:
  contents: write       # Releaseの作成とファイル更新に必要
  pull-requests: read   # PR情報の取得に必要
  issues: read          # 関連Issueの取得に必要
```

## ドライランモード

変更を加えずに生成されるリリースノートをプレビュー：

```yaml
- name: Preview Release Notes
  uses: tako-dayo8/auto-release-notes@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    dry-run: true
```

出力例：
```
[DRY RUN] Generated release notes:
----------------------------------------
## [1.0.0] - 2025-01-31
...
----------------------------------------
[DRY RUN] Would write to: CHANGELOG.md
[DRY RUN] Would create GitHub Release: v1.0.0
```

## 使用例

### プレリリース対応

```yaml
on:
  push:
    tags:
      - 'v*.*.*'
      - 'v*.*.*-beta.*'
      - 'v*.*.*-rc.*'
```

プレリリースバージョン（`-alpha`、`-beta`、`-rc`、`-pre`を含む）は、GitHub Releasesで自動的にプレリリースとしてマークされます。

### カスタムChangelogの場所

```yaml
with:
  changelog-file: docs/releases/CHANGELOG.md
```

### バージョンファイルの無効化

```yaml
with:
  version-file: false  # changelog/に個別ファイルを作成しない
```

## トラブルシューティング

### リリースノートが生成されない

- タグがSemantic Versioningに従っているか確認：`v1.0.0`、`v2.3.5`など
- checkoutステップで`fetch-depth: 0`が設定されているか確認
- GitHubトークンが必要な権限を持っているか確認

### "Invalid tag format"エラー

タグは以下の条件を満たす必要があります：
- `v`で始まる（例：`v1.0.0`）
- Semantic Versioningに従う（Major.Minor.Patch）
- 有効なタグの例：`v1.0.0`、`v2.3.5-beta.1`
- 無効なタグの例：`1.0.0`、`release-1.0.0`

### APIレート制限

アクションには指数バックオフを使用したリトライロジックが組み込まれています。非常に大規模なリポジトリ（1000以上のPR）の場合：
- 実行頻度を減らす
- より高いレート制限を持つパーソナルアクセストークンの使用を検討

## 開発

開発ガイドラインは[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

### テストの実行

```bash
npm test              # 全テストを実行
npm run test:watch   # ウォッチモードでテストを実行
npm run test:coverage # カバレッジレポート付きでテストを実行
```

### ビルド

```bash
npm run build  # TypeScriptをコンパイルしてnccでバンドル
```

## ライセンス

[MIT](LICENSE)

## クレジット

以下のライブラリを使用して構築：
- [@actions/core](https://github.com/actions/toolkit/tree/main/packages/core)
- [@actions/github](https://github.com/actions/toolkit/tree/main/packages/github)
- [conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog)

---

**注意**: このアクションは、Conventional Commitsに従うか、カテゴリ分類にGitHubラベルを使用するリポジトリで動作するように設計されています。最良の結果を得るには、プロジェクト全体で一貫したコミットメッセージの形式を維持してください。
