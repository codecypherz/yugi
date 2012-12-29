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

public class CrawlTaskMakerServlet extends HttpServlet {

	private static final long serialVersionUID = -1840454134524377791L;
	
	private static final Logger logger = Logger.getLogger(
			CrawlTaskMakerServlet.class.getName());
	
	/**
	 * Creates the task that will crawl and create the auto upload cards.
	 */
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		PrintWriter writer = resp.getWriter();
		
		QueueFactory.getDefaultQueue().add(
				withUrl("/tasks/crawl")
				.method(Method.GET));
		
		String message = "Created the task to crawl for auto upload cards.";
		logger.info(message);
		writer.write(message);
	}
}
