import { AlertCircle } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Card } from "../ui/Card.jsx";
import { getErrorMessage } from "../../lib/httpClient.js";

export function QueryErrorPanel({ error, onRetry, title = "Something went wrong", className = "" }) {
  const message = getErrorMessage(error, title);
  return (
    <Card
      className={`border-red-200/80 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/30 ${className}`}
      role="alert"
    >
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" aria-hidden />
        <div className="min-w-0">
          <p className="font-medium text-red-900 dark:text-red-100">{title}</p>
          <p className="mt-1 text-sm text-red-800/90 dark:text-red-200/90">{message}</p>
          {onRetry && (
            <Button type="button" variant="secondary" className="mt-4" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
