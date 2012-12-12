package yugi.servlet;

/**
 * The set of HTTP response status codes used in the application.
 */
public enum ResponseStatusCode {
	BAD_REQUEST(400),
	INTERNAL_SERVER_ERROR(500);

	private int code;
	private ResponseStatusCode(int code) {
		this.code = code;
	}
	public int getCode() {
		return this.code;
	}
}
