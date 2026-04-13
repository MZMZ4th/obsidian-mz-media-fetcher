import { AbstractInputSuggest, TFile } from "obsidian";

export class TemplatePathSuggest extends AbstractInputSuggest<TFile> {
  getSuggestions(inputStr: string): TFile[] {
    const query = String(inputStr || "").trim().toLowerCase();
    return this.app.vault
      .getAllLoadedFiles()
      .filter((file: any) => file instanceof TFile && file.extension === "md")
      .filter((file: TFile) => !query || file.path.toLowerCase().includes(query))
      .slice(0, 100);
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.setText(file.path);
  }

  selectSuggestion(file: TFile): void {
    this.textInputEl.value = file.path;
    this.textInputEl.trigger("input");
    this.close();
  }
}

export class FolderPathSuggest extends AbstractInputSuggest<any> {
  getSuggestions(inputStr: string): any[] {
    const query = String(inputStr || "").trim().toLowerCase();
    return this.app.vault
      .getAllFolders()
      .filter((folder: any) => folder.path)
      .filter((folder: any) => !query || folder.path.toLowerCase().includes(query))
      .slice(0, 100);
  }

  renderSuggestion(folder: any, el: HTMLElement): void {
    el.setText(folder.path);
  }

  selectSuggestion(folder: any): void {
    this.textInputEl.value = folder.path;
    this.textInputEl.trigger("input");
    this.close();
  }
}
