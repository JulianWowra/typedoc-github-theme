import { cpSync } from 'fs';
import { dirname, resolve } from 'path';
import type { PageEvent, Reflection, Renderer } from 'typedoc';
import { DefaultTheme, JSX, RendererEvent } from 'typedoc';
import { fileURLToPath } from 'url';
import { GitHubThemeContext } from './GitHubThemeContext.js';

export class GitHubTheme extends DefaultTheme {
	constructor(renderer: Renderer) {
		super(renderer);

		// copy the complete assets
		renderer.on(RendererEvent.END, () => {
			const from = resolve(dirname(fileURLToPath(import.meta.url)), '../src/assets/');
			const to = resolve(this.application.options.getValue('out'), 'assets/');

			cpSync(from, to, { recursive: true });
		});

		// link the css file
		renderer.hooks.on('head.end', (event) => (
			<>
				<link rel="stylesheet" href={event.relativeURL('assets/typedoc-github-style.css')} />
			</>
		));

		// set the Shiki theme
		renderer.application.on('bootstrapEnd', () => {
			if (!this.application.options.isSet('lightHighlightTheme')) {
				this.application.options.setValue('lightHighlightTheme', 'github-light-default');
			}

			if (!this.application.options.isSet('darkHighlightTheme')) {
				this.application.options.setValue('darkHighlightTheme', 'github-dark-default');
			}
		});
	}

	getRenderContext(pageEvent: PageEvent<Reflection>) {
		return new GitHubThemeContext(this.router, this, pageEvent, this.application.options);
	}
}
