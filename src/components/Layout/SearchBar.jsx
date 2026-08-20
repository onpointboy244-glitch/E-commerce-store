import { useState, useMemo } from "react";
import { useProducts } from "../../Hooks/useProducts";
import { useNavigate } from "react-router-dom";

export const SearchBar = ({ onSearchSelect }) => {
  const navigate = useNavigate();
  const { data: products, isLoading: loading } = useProducts("all");
  const [SearchInput, setSearchInput] = useState("");

  const suggestions = useMemo(() => {
    if (!SearchInput.trim() || loading || !products) return [];
    return products.filter((product) =>
      product.name.toLowerCase().includes(SearchInput.toLowerCase()),
    );
  }, [SearchInput, products, loading]);

  return (
    <div className="search-wrapper flex-grow-1 ms-2 me-auto">
      <i className="bi bi-search search-icon"></i>
      <input
        className="inputClass"
        type="search"
        placeholder="search for something"
        value={SearchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      {SearchInput && (
        <i
          className="bi bi-x-lg position-absolute end-0 top-50 translate-middle-y me-3 search-clear-icon"
          style={{ zIndex: 10 }}
          onClick={() => setSearchInput("")}
        ></i>
      )}
      {SearchInput && suggestions.length > 0 && (
        <div
          id="products-suggestions"
          className="search-options"
          style={{ display: "block" }}
        >
          {!loading &&
            suggestions.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSearchInput("");
                  if (onSearchSelect) {
                    // On homepage — callback handles category + scroll
                    onSearchSelect(product.id, product.type);
                  } else {
                    // On another page — navigate home with data
                    navigate("/", {
                      state: { category: product.type, productId: product.id },
                    });
                  }
                }}
                className="search-item d-block text-decoration-none"
              >
                {product.name}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
