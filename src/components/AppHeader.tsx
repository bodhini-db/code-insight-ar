import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

const AppHeader = ({ title, showBack = false, rightAction }: AppHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-header px-4 py-3">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-1 text-header-foreground transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-header-foreground">{title}</h1>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
};

export default AppHeader;
