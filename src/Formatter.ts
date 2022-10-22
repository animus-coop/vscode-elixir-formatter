import { window, workspace } from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export default class Formatter {
  public format(targetText: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const targetPath: string = window.activeTextEditor.document.fileName;
      const targetExt: string = path.extname(targetPath);

      // Create tmp file
      const tmpDir: string = path.join(os.tmpdir(), 'vscode-elixir-mix-formatter');

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
      }

      const tmpFileName: string = path.normalize(
        `${tmpDir}/animus-${Math.random()
          .toString(36)
          .substring(7)
          .replace(/[^a-z]+/g, '')}${targetExt}`
      );

      try {
        fs.writeFileSync(tmpFileName, targetText);
      } catch (err) {
        return reject(new Error(`Could not create tmp file in "${tmpDir}"`));
      }

      // Run mix formatter script
      try {
        const cwd = workspace.workspaceFolders[0].uri.fsPath;
        cp.execSync(`mix format ${tmpFileName}`, { cwd });
      } catch (err) {
        console.error('Mix Formatter: ' + err);

        try {
          fs.unlinkSync(tmpFileName);
        } catch (err) {}

        return reject(new Error('Failed to format the document'));
      }

      // Get formatted text
      const formatted: string = fs.readFileSync(tmpFileName, 'utf-8');

      // Remove tmp file
      try {
        fs.unlinkSync(tmpFileName);
      } catch (err) {}

      // Return new document text
      if (formatted.length > 0) {
        resolve(formatted);
      } else {
        reject();
      }
    });
  }
}
