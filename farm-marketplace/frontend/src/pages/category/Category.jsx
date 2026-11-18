import { Link, useParams, useSearchParams } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import ProductList from "../../components/productList/ProductList";
import CategoryChips from "../../components/categoryChips/CategoryChips";
import { CATEGORIES } from "../../utils/constants";
import "./Category.css";

function CategoryProducts({ category, region }) {
  const list = useProducts({ category, region });
  return (
    <ProductList
      items={list.items}
      total={list.total}
      loading={list.loading}
      error={list.error}
      hasMore={list.hasMore}
      onMore={list.loadMore}
      emptyText="Nothing in this category yet. Check back soon."
    />
  );
}

export default function Category() {
  const { category } = useParams();
  const [params] = useSearchParams();
  const region = params.get("region") || "";
  const label = CATEGORIES.find(([value]) => value === category)?.[1];

  if (!label) {
    return (
      <div className="container category">
        <h1>Category not found</h1>
        <p>
          <Link to="/">Back to the home page</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container category">
      <nav className="category-crumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{label}</span>
      </nav>

      <h1>{label}</h1>
      <p className="category-sub">
        Every kind of {label.toLowerCase()} from local sellers and our own catalogue
        {region ? `, available in ${region}` : ""}.
      </p>

      <CategoryChips active={category} />
      <CategoryProducts category={category} region={region} />
    </div>
  );
}