import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("Erreur 404 : tentative d’accès à une page inexistante →", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl font-extrabold text-gray-800">404</h1>
        <p className="mb-4 text-lg text-gray-600">
          Oups ! La page que vous cherchez n’existe pas ou a été déplacée.
        </p>
        <a
          href="/"
          className="text-gray-600 underline hover:text-gray-500 font-medium"
        >
          Retour à l’accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
