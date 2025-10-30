# TODO: 拡張機能実装

作成日: 2025-01-31
ステータス: 🟢 完了

## 概要

コア機能に加えて、GitHubラベル対応、除外設定、コントリビューター表示、個別バージョンファイル出力、GitHub Releases作成機能を実装します。これによりリリースノートの品質と利便性を向上させます。

## タスク一覧

### ✅ GitHubラベル対応（categorizer.ts拡張）

- [ ] PRラベル取得機能の追加
- [ ] ラベルとカテゴリのマッピング定義
  ```typescript
  const labelMapping = {
    'feature': 'features',
    'enhancement': 'features',
    'bug': 'bugFixes',
    'bugfix': 'bugFixes',
    'documentation': 'documentation',
    'performance': 'performance',
    'breaking-change': 'breaking',
  };
  ```
- [ ] Conventional Commitsがない場合のフォールバック処理
  - PRのラベルを確認
  - マッピングに従ってカテゴリを決定
  - どちらもない場合は"Other Changes"に分類
- [ ] 複数ラベルの優先順位処理
  - breaking > features > bugFixes の順

### ✅ 除外設定機能（filter.ts新規作成）

- [ ] chore コミットの除外
  - 正規表現パターン: `^chore:`、`^chore\(.*?\):`
  - コミットリストからフィルタリング
- [ ] 特定ラベルPRの除外
  - デフォルト除外ラベル: `skip-changelog`, `no-changelog`
  - inputs.exclude-labelsから追加ラベル取得
  - PRリストからフィルタリング
- [ ] マージコミットの除外（オプション）
  - パターン: `^Merge branch`, `^Merge pull request`
  - 設定で有効/無効を切り替え
- [ ] フィルタリング統計のログ出力
  ```
  info: Excluding 5 chore commits
  info: Excluding 2 PRs with skip-changelog label
  ```

### ✅ コントリビューター表示（contributors.ts新規作成）

- [ ] コントリビューター情報収集
  - PRの作成者を抽出
  - コミットの作成者を抽出
  - Issueの作成者を抽出（オプション）
- [ ] 重複排除処理
  - Set または Map で一意化
  - bot アカウントの除外（dependabot, renovate等）
- [ ] アルファベット順ソート
- [ ] フォーマット生成
  ```markdown
  ### Contributors
  @alice, @bob, @charlie
  ```
- [ ] 貢献者数の統計
  ```
  info: 3 contributors in this release
  ```

### ✅ 個別バージョンファイル出力（writer.ts拡張）

- [ ] changelog/ディレクトリの作成
  - ディレクトリが存在しない場合は自動作成
- [ ] バージョンファイル名生成
  - 形式: `changelog/{version}.md`
  - 例: `changelog/1.0.0.md`, `changelog/2.1.0.md`
- [ ] 個別ファイルのテンプレート
  - バージョン番号、日付をヘッダーに
  - 全カテゴリの変更内容
  - コントリビューターリスト
  - 比較リンク
- [ ] inputs.version-file設定の反映
  - true: 個別ファイルを作成
  - false: スキップ
- [ ] ファイル作成のログ出力
  ```
  info: Writing version file to changelog/1.0.0.md
  ```

### ✅ GitHub Releases作成（releases.ts新規作成）

- [ ] GitHub Releases API統合
  ```typescript
  await octokit.rest.repos.createRelease({
    owner,
    repo,
    tag_name: version,
    name: `Release ${version}`,
    body: releaseNotes,
    draft: false,
    prerelease: isPrereleaseVersion(version),
  });
  ```
- [ ] プレリリース判定機能
  - バージョンに`-alpha`, `-beta`, `-rc`が含まれる場合
  - `prerelease: true`を設定
- [ ] ドラフト作成モード（オプション）
  - inputs.release-draft設定の追加
  - true時は`draft: true`
- [ ] 既存リリースの確認
  - 同じタグのリリースが既に存在する場合
  - 上書きするか、スキップするか選択
- [ ] リリースURL出力
  - outputsにchangelog-urlをセット
  - ログに出力
  ```
  success: GitHub Release created: https://github.com/owner/repo/releases/tag/v1.0.0
  ```
- [ ] inputs.create-github-release設定の反映
  - true: リリース作成
  - false: スキップ

### ✅ 比較リンク生成（utils.ts拡張）

- [ ] 前バージョンとの比較URL生成
  ```typescript
  function generateCompareUrl(
    owner: string,
    repo: string,
    previousVersion: string,
    currentVersion: string
  ): string {
    return `https://github.com/${owner}/${repo}/compare/${previousVersion}...${currentVersion}`;
  }
  ```
- [ ] CHANGELOG.mdとバージョンファイルに追加
  ```markdown
  **Full Changelog**: https://github.com/owner/repo/compare/v0.9.0...v1.0.0
  ```
- [ ] 初回リリース時の処理
  - 比較リンクなし、または全履歴へのリンク

### ✅ Issue番号の自動リンク化（formatter.ts新規作成）

- [ ] テキスト内の#123形式を検出
  - 正規表現: `#(\d+)`
- [ ] GitHubリンクに変換
  ```markdown
  Fix login issue (#123)
  ↓
  Fix login issue ([#123](https://github.com/owner/repo/issues/123))
  ```
- [ ] PRとIssueの両方に対応
- [ ] 既にリンク化されている場合はスキップ

## 完了条件

- [x] Conventional Commitsがない場合でもGitHubラベルで分類できる
- [x] chore コミットと特定ラベルのPRが正しく除外される
- [x] コントリビューターリストが重複なく、ソート済みで表示される
- [x] changelog/ディレクトリに個別バージョンファイルが作成される
- [x] GitHub Releasesに自動的にリリースが作成される
- [x] プレリリースバージョンが正しく判定される
- [x] 比較リンクが正しく生成される
- [x] Issue番号が自動的にリンク化される

## メモ

### 拡張後のファイル構成
```
src/
├── main.ts
├── collector.ts
├── parser.ts
├── categorizer.ts      # ラベル対応追加
├── filter.ts           # 新規: 除外処理
├── contributors.ts     # 新規: コントリビューター
├── writer.ts           # 個別ファイル出力追加
├── releases.ts         # 新規: GitHub Releases
├── formatter.ts        # 新規: フォーマット処理
└── utils.ts            # 比較リンク追加
```

### bot除外リスト
```typescript
const botAccounts = [
  'dependabot[bot]',
  'renovate[bot]',
  'github-actions[bot]',
  'greenkeeper[bot]',
];
```

### プレリリース判定例
```typescript
function isPrereleaseVersion(version: string): boolean {
  return /-alpha|-beta|-rc|-pre/.test(version);
}
```

### 参考リンク
- [GitHub Releases API](https://docs.github.com/en/rest/releases/releases)
- [GitHub Labels](https://docs.github.com/en/issues/using-labels-and-milestones-to-track-work)
