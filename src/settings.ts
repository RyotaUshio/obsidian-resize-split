import { PluginSettingTab, Setting } from 'obsidian';
import ResizeSplitPlugin from 'main';


export interface ResizeSplitSettings {
	step: number;
}

export const DEFAULT_SETTINGS: ResizeSplitSettings = {
	step: 5,
};

// Inspired by https://stackoverflow.com/a/50851710/13613783
export type KeysOfType<Obj, Type> = NonNullable<{ [k in keyof Obj]: Obj[k] extends Type ? k : never }[keyof Obj]>;

export class ResizeSplit extends PluginSettingTab {
	constructor(public plugin: ResizeSplitPlugin) {
		super(plugin.app, plugin);
	}

	addSliderSetting(settingName: KeysOfType<ResizeSplitSettings, number>, min: number, max: number, step: number) {
		return new Setting(this.containerEl)
			.addSlider((slider) => {
				slider.setLimits(min, max, step)
					.setValue(this.plugin.settings[settingName])
					.setDynamicTooltip()
					.onChange(async (value) => {
						// @ts-ignore
						this.plugin.settings[settingName] = value;
						await this.plugin.saveSettings();
					});
			});
	}
	
	display() {
		this.containerEl.empty();

		this.addSliderSetting('step', 1, 30, 1)
			.setName('Resize step size (%)');
	}
}
