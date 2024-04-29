import { Plugin, WorkspaceItem, WorkspaceSplit } from 'obsidian';
import { ResizeSplitSettings, DEFAULT_SETTINGS, ResizeSplit } from 'settings';


declare module 'obsidian' {
	interface Workspace {
		requestResize(): void;
	}

	interface WorkspaceItem {
		containerEl: HTMLElement;
		parent?: WorkspaceParent;
		dimension: number | null;
		setDimension(dimension: number | null): void;
	}

	interface WorkspaceParent {
		children: WorkspaceItem[];
	}

	interface WorkspaceSplit {
		getElSize(el: HTMLElement): number | undefined;
	}
}


export default class ResizeSplitPlugin extends Plugin {
	settings: ResizeSplitSettings;

	async onload() {
		await this.loadSettings();
		await this.saveSettings();
		this.addSettingTab(new ResizeSplit(this));

		this.addCommand({
			id: 'resize-left',
			name: 'Resize to left or top',
			checkCallback: (checking) => this.resizeActiveSplit(checking, -1, this.settings.step),
			repeatable: true
		});

		this.addCommand({
			id: 'resize-right',
			name: 'Resize to right or bottom',
			checkCallback: (checking) => this.resizeActiveSplit(checking, +1, this.settings.step),
			repeatable: true
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	resizeActiveSplit(checking: boolean, direction: 1 | -1, step: number) {
		let split: WorkspaceItem = this.app.workspace.rootSplit;
		while (split) {
			if (!(split instanceof WorkspaceSplit)) return false;
			if (split.children.length > 2) return false;
			if (split.children.length === 2) break;
			split = split.children[0];
		}

		const [leftChild, rightChild] = split.children;
		const leftSize = split.getElSize(leftChild.containerEl);
		const rightSize = split.getElSize(rightChild.containerEl);

		if (typeof leftSize !== 'number' || typeof rightSize !== 'number') {
			return false;
		}

		if (!checking) {
			const clip = (val: number) => Math.max(Math.min(val, 90), 10);
			const leftDimension = clip(leftSize / (leftSize + rightSize) * 100);

			const newLeftDimension = clip(Math.round((leftDimension + step * direction) / step) * step);
			const newRightDimension = 100 - newLeftDimension;

			leftChild.setDimension(newLeftDimension);
			rightChild.setDimension(newRightDimension);

			this.app.workspace.requestSaveLayout();
			this.app.workspace.requestResize();
		}

		return true;
	}
}
