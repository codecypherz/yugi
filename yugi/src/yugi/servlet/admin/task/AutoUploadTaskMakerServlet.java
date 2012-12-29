package yugi.servlet.admin.task;

import static com.google.appengine.api.taskqueue.TaskOptions.Builder.withUrl;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.PMF;
import yugi.model.auto.AutoUploadCard;
import yugi.model.auto.AutoUploadCard.Status;

import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions.Method;

public class AutoUploadTaskMakerServlet extends HttpServlet {

	private static final long serialVersionUID = -5002027751381337203L;

	private static final Logger logger = Logger.getLogger(
			AutoUploadTaskMakerServlet.class.getName());
	
	/**
	 * This will query for the first 100 incomplete auto upload card entries
	 * and queue tasks for them.
	 */
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		
		PrintWriter writer = resp.getWriter();
		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			List<AutoUploadCard> incompleteEntries = findIncompleteEntries(pm);
			if (incompleteEntries == null || incompleteEntries.size() == 0) {
				logger.info("Didn't find any entries.");
				writer.write("Didn't find any entries.");
				return;
			}
			logger.info("Found " + incompleteEntries.size() + " entries.");
			
			Queue queue = QueueFactory.getDefaultQueue();
			for (AutoUploadCard autoUploadCard : incompleteEntries) {
				queue.add(
						withUrl("/tasks/auto_upload")
						.param("key", autoUploadCard.getKeyAsString())
						.method(Method.GET));
			}
			logger.info("Created " + incompleteEntries.size() + " tasks.");
		} finally {
			pm.close();
		}
	}
	
	/**
	 * Finds incomplete auto upload cards.
	 * @param pm The persistence manager.
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private List<AutoUploadCard> findIncompleteEntries(PersistenceManager pm) {
		logger.info("Querying for incomplete auto upload cards");
		
		Query query = pm.newQuery(AutoUploadCard.class);
		// The ":" here is an implicit type.  Declaring the import for the
		// status enum doesn't seem to work.
		query.setFilter("status == :statusParam");
		query.setRange(0, 100);
		
		try {
			return (List<AutoUploadCard>) query.execute(Status.INITIAL);
		} finally {
			query.closeAll();
		}
	}
}
