/*********************************************************************

 TinyMCE4 prismプラグイン / prism plugin for TinyMCE4

 ライセンス / License：LGPL
 ver.1.0.2 (2020/04/03)
 Homepage : https://holydragoon.jp/
 Copyright(C) 2018-2020 Kaori MINAKATA.

*********************************************************************/

tinymce.PluginManager.requireLangPack('prism');
tinymce.PluginManager.add('prism', function(editor, url) {
	function showDialog() {
		var win, dom = editor.dom, selection = editor.selection, data = {}, Pre, Elmt, ln, fl, hl;
		var defaultSelect = {}, defaultLanguage = 'markup', selected = false, selectedCode, brTag = '';
		var selectionNode = selection.getNode();

		if (selectionNode.nodeName.toLowerCase() == 'code') {
			var text = $(selectionNode).unwrap().text();
			text     = text.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\n{2}/g, '<p>').replace(/\n/g, '<br>').replace(/ /g, "&nbsp;").replace(/\t/g, '　　　　');
			selection.setContent(text);
			selectionNode.remove();
		} else {
			//初期設定（この設定は変更しないでください！） / Initial setting value (Please don't change this setting!)
			defaultSelect.linenumber = true;
			defaultSelect.firstline  = '';
			defaultSelect.highlight  = '';

			data.language   = '';
			data.firstline  = defaultSelect.firstline;
			data.linenumber = defaultSelect.linenumber;
			data.highlight  = defaultSelect.highlight;

			//言語設定 / Language settings
			//tinymce.initでprism_languages: [{text: '○○', value: '○○'},～];で指定した言語設定が代入されます / The language setting specified by prism_languages: [{text: 'xx', value: 'xx'}, ~]; will be assigned in tinymce.init.
			var settingItems = editor.settings.prism_languages;

			//デフォルトの言語設定（initで指定がなかった場合） / Default language setting (unless specified by init)
			var defaultLanguages = [
				{text: 'HTML/XML',   value: 'markup'},
				{text: 'CSS',        value: 'css'},
				{text: 'C-like',     value: 'clike'},
				{text: 'JavaScript', value: 'javascript'}
			];

			var languageItems = settingItems ? settingItems : defaultLanguages;

			selectedCode = selection.getContent({format : 'text'});

			for (var i = 0; i < languageItems.length; i++) {
				if (languageItems[i].value == data.language) {
					languageItems[i].selected = true;
				}
			}

			data.code = selectedCode;
			if (data.code == '') {
				brTag = '<br>';
			}
			if (data.code == '&nbsp;') {
				data.code = '';
			}

			win = editor.windowManager.open({
				title: 'Prism - Code Editor',
				data: data,
				minWidth: 450,
				body: [
					{name: 'language', type: 'listbox', values: languageItems},
					{name: 'code',   type: 'textbox', minHeight: 200, multiline: true},
					{
						type: 'form',
						padding: 0,
						labelGap: 5,
						spacing: 5,
						align: 'center',
						direction: 'row',
						items: [
							{name: 'linenumber', type: 'checkbox', text: 'Line Number', checked: data.linenumber},
							{name: 'firstline',  type: 'textbox',  label: 'First Line', size: 3,  value: data.firstline},
							{name: 'highlight',  type: 'textbox',  label: 'Highlight',  size: 10, value: data.highlight},
						]
					}
				],
				onsubmit: function(e) {
					if (e.data.code === '') {
						tinyMCE.activeEditor.windowManager.alert("Please insert your code.");

						return;
					} else {
						var code = e.data.code;
						code     = code.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/　{4}/g, "\t");
						var language   = e.data.language ? e.data.language : defaultLanguage;
						var firstline  = e.data.firstline ? e.data.firstline : '';
						var linenumber = e.data.linenumber ? e.data.linenumber : false;
						var highlight  = e.data.highlight ? e.data.highlight : '';

						//<code>の中身を設定 / Set contents of <code>
						Elmt = dom.create('code',{
							'class': 'language-' + language,
						}, code);

						//行数を表示するときの設定 / Settings for displaying the number of lines
						if (linenumber) {
							ln = ' class="line-numbers"';
						}

						//開始行の設定 / Setting the start line
						if (firstline != '') {
							fl = ' data-start="' + firstline + '"';
						}

						//強調する行の設定 / Set line to highlight
						if (highlight != '') {
							hl = ' data-line="' + highlight + '"';
						}

						if (ln === undefined) {
							editor.insertContent('<pre>' + dom.getOuterHTML(Elmt) + '</pre>' + brTag);
						} else {
							editor.insertContent('<pre' + ln + fl + hl +'>' + dom.getOuterHTML(Elmt) + '</pre>' + brTag);
						}
					}
				}
			});
		}
	}
	editor.addButton('prism', {
		icon: 'codesample',
		tooltip: 'Insert code with Prism',
		onPostRender: function() {
			var btn = this;
			editor.on('NodeChange', function(e) {
				var parent = e.element.parentNode;
				btn.active(e.element.nodeName.toLowerCase() == 'code' && parent.tagName.toLowerCase() == 'pre');
			});
		},
		onclick: showDialog
	});
	editor.addMenuItem('prism', {
		text: 'Prism',
		icon: 'codesample',
		context: 'insert',
		onclick: showDialog
	});
});