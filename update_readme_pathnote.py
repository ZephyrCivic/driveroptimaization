from pathlib import Path

path = Path('README.md')
text = path.read_text(encoding='utf-8')
marker = '- **ローカルサーバー起動:** `npm run dev -- --port 3000` を推奨手順とし、ブラウザからは `http://localhost:3000/` を基準 URL としてアクセスする（5173 が使用中の場合もポート指定で安定稼働）。'
addition = "  - Vite 6 はプロジェクトパスに `#` など URL 解釈対象の文字が含まれるとモジュール解決に失敗するため、開発作業時は `C:/Projects/saitekika-demo` などシンプルなパスへコピーして作業し、ビルド成果物のみ必要に応じて OneDrive へ反映する。"
if addition not in text:
    text = text.replace(marker, marker + "\n" + addition)
    path.write_text(text, encoding='utf-8')
