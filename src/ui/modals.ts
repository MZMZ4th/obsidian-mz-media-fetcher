import { FuzzySuggestModal, Modal, Setting } from "obsidian";
import type { SourceSuggestItem } from "../types.ts";

export class QueryInputModal extends Modal {
  options: {
    title: string;
    hint: string;
    placeholder: string;
  };
  value: string;
  result: string | null;
  resolved: boolean;
  resolvePromise?: (value: string | null) => void;

  constructor(app: any, options: { title: string; hint: string; placeholder: string }) {
    super(app);
    this.options = options;
    this.value = "";
    this.result = null;
    this.resolved = false;
    this.setTitle(options.title);
  }

  openAndWait(): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.open();
    });
  }

  onOpen(): void {
    const { contentEl } = this;
    let textComponent: any = null;

    contentEl.empty();
    contentEl.createEl("p", { text: this.options.hint });

    new Setting(contentEl).setName("作品名、链接或 ID").addText((text) => {
      textComponent = text;
      text
        .setPlaceholder(this.options.placeholder)
        .setValue(this.value)
        .onChange((value: string) => {
          this.value = value;
        });

      text.inputEl.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault();
          this.closeWith(this.value.trim());
        }
      });
    });

    const footer = new Setting(contentEl);
    footer.addButton((button) => {
      button.setButtonText("取消");
      button.onClick(() => this.closeWith(null));
    });
    footer.addButton((button) => {
      button.setButtonText("继续");
      button.setCta();
      button.onClick(() => this.closeWith(this.value.trim()));
    });

    window.setTimeout(() => {
      if (textComponent?.inputEl) {
        textComponent.inputEl.focus();
        textComponent.inputEl.select();
      }
    }, 0);
  }

  onClose(): void {
    this.contentEl.empty();
    if (!this.resolved && this.resolvePromise) {
      this.resolvePromise(this.result);
      this.resolved = true;
    }
  }

  closeWith(result: string | null): void {
    this.result = result || null;
    if (!this.resolved && this.resolvePromise) {
      this.resolvePromise(this.result);
      this.resolved = true;
    }
    this.close();
  }
}

export class SourceSuggestModal<TItem> extends FuzzySuggestModal<SourceSuggestItem<TItem>> {
  options: { title: string; items: SourceSuggestItem<TItem>[] };
  result: TItem | null;
  resolved: boolean;
  resolvePromise?: (item: TItem | null) => void;

  constructor(app: any, options: { title: string; items: SourceSuggestItem<TItem>[] }) {
    super(app);
    this.options = options;
    this.result = null;
    this.resolved = false;
    this.setPlaceholder(options.title);
    this.setInstructions([
      { command: "Enter", purpose: "确认条目" },
      { command: "Esc", purpose: "取消" },
    ]);
  }

  openAndWait(): Promise<TItem | null> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.open();
    });
  }

  getItems(): SourceSuggestItem<TItem>[] {
    return this.options.items;
  }

  getItemText(item: SourceSuggestItem<TItem>): string {
    return [item.title || "", item.subtitle || "", item.searchText || ""]
      .filter(Boolean)
      .join(" ");
  }

  renderSuggestion(match: any, el: HTMLElement): void {
    const wrapped = match?.item ?? match;
    el.createEl("div", { text: wrapped?.title || "未命名条目" });
    if (wrapped?.subtitle) {
      const meta = el.createEl("small", { text: wrapped.subtitle });
      meta.style.opacity = "0.75";
    }
  }

  onChooseItem(item: SourceSuggestItem<TItem>): void {
    this.result = item.item;
    if (!this.resolved && this.resolvePromise) {
      this.resolvePromise(item.item);
      this.resolved = true;
    }
  }

  onClose(): void {
    super.onClose();
    window.setTimeout(() => {
      if (!this.resolved && this.resolvePromise) {
        this.resolvePromise(this.result);
        this.resolved = true;
      }
    }, 0);
  }
}
