package yugi.servlet.admin.task;

import static com.google.appengine.api.taskqueue.TaskOptions.Builder.withUrl;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions.Method;

public class DeleteAutoUploadCardsTaskMakerServlet extends HttpServlet {

	private static final long serialVersionUID = -2715224555118654796L;

	private static final Logger logger = Logger.getLogger(
			DeleteAutoUploadCardsTaskMakerServlet.class.getName());
	
	/**
	 * This will create the task to delete all of the auto upload cards.
	 */
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		PrintWriter writer = resp.getWriter();
		
		QueueFactory.getDefaultQueue().add(
				withUrl("/tasks/delete_auto_upload_cards")
				.method(Method.GET));
		
		String message = "Created the task to delete the auto upload cards.";
		logger.info(message);
		writer.write(message);
	}
}
