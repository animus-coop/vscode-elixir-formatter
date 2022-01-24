import { languages, window, Disposable, TextDocument, TextEdit, Position, Range, ProgressLocation } from 'vscode';
import Formatter from './Formatter';

export default class Provider {
  private formatter: Formatter;

  public constructor() {
    this.formatter = new Formatter();
  }

  public documentFormattingEditProvider(): Disposable {
    return languages.registerDocumentFormattingEditProvider(
      { scheme: 'file', pattern: '**/*.{ex,exs,heex}' },
      {
        provideDocumentFormattingEdits: (document: TextDocument) => {
          return window.withProgress(
            {
              location: ProgressLocation.Notification,
              title: 'Mix Formatter: Formatting document',
            },
            () => {
              return new Promise<any>((resolve, reject) => {
                const targetText: string = document.getText();
                const lastLine = document.lineAt(document.lineCount - 1);
                const range: Range = new Range(new Position(0, 0), lastLine.range.end);

                setTimeout(() => {
                  this.formatter
                    .format(targetText)
                    .then((text: string) => resolve([new TextEdit(range, text)]))
                    .catch((err) => {
                      if (err instanceof Error) {
                        window.showErrorMessage(`Mix Formatter: ${err.message}`);
                      }
                      reject();
                    });
                });
              });
            }
          );
        },
      }
    );
  }
}
