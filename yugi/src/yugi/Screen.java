package yugi;

/**
 * Contains all the screen configuration like which HTML, CSS, and JS files go
 * together.
 */
public enum Screen {
	
	CARD("card.html", "card.js", "card.css", true),
	DECK_EDITOR("deck-editor.html", "deck-editor.js", "deck-editor.css", false),
	DECK_MANAGER("deck-manager.html", "deck-manager.js", "deck-manager.css", false),
	GAME("game.html", "game.js", "game.css", false),
	LANDING("landing.html", "landing.js", "landing.css", false),
	SEARCH("search.html", "search.js", "search.css", true);
	
	private static final String DEV_PREFIX = "dev/dev-";
	
	private final String htmlPath;
	private final String devHtmlPath;
	private final String jsPath;
	private final String cssPath;

	/**
	 * Constructs a screen configuration.
	 * @param htmlPath The path to the normal HTML file.
	 * @param jsFileName The name of the JS file.
	 * @param cssPath The name of the CSS file.
	 * @param isAdmin True if this is an admin screen.
	 */
	private Screen(
			String htmlFileName,
			String jsFileName,
			String cssFileName,
			boolean isAdmin) {
		
		// The paths are different for admin vs. normal screens.
		if (isAdmin == true) {
			// Figure out the base path.  For some reason, HTML cannot be read using
			// the "/admin/" path, but can with the "admin/" path.  JS and CSS seem
			// to not have the same restriction.
			htmlPath = "admin/" + htmlFileName;
			jsPath = "/js/admin/" + jsFileName + "?v=" + Config.VERSION;
			cssPath = "/css/admin/" + cssFileName + "?v=" + Config.VERSION;
		} else {
			htmlPath = htmlFileName;
			jsPath = "/js/" + jsFileName + "?v=" + Config.VERSION;
			cssPath = "/css/" + cssFileName + "?v=" + Config.VERSION;
		}
		
		// The development path is always the same.
		devHtmlPath = DEV_PREFIX + htmlFileName;
	}
	
	public String getHtmlPath() {
		return htmlPath;
	}
	
	public String getDevHtmlPath() {
		return devHtmlPath;
	}
	
	public String getJsPath() {
		return jsPath;
	}
	
	public String getCssPath() {
		return cssPath;
	}
}
