import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/Button.jsx";
import { Card } from "./ui/Card.jsx";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
          <Card className="max-w-md border-amber-200/80 bg-amber-50/90 dark:border-amber-900/40 dark:bg-amber-950/40">
            <div className="flex gap-3">
              <AlertTriangle className="h-8 w-8 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <div>
                <h1 className="font-display text-lg font-semibold text-amber-950 dark:text-amber-100">
                  This view crashed
                </h1>
                <p className="mt-2 text-sm text-amber-900/90 dark:text-amber-200/90">
                  Try refreshing the page. If the problem continues, clear your cache or contact support.
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() => {
                    this.setState({ error: null });
                    window.location.reload();
                  }}
                >
                  Reload page
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
