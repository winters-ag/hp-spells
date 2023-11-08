const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item btn-secondary">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: {hits:action.payload}
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets data from HP Database about spells
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("MIT");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;
  const types = ['Charm','Conjuration', 'Spell', 'Transfiguration', 'HealingSpell', 'DarkCharm','Jinx','Curse','MagicalTransportation','Hex','CounterSpell','DarkArts','CounterJinx','CounterCharm','Untransfiguration','BindingMagicalContract','Vanishment']
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://wizard-world-api.herokuapp.com/Spells",
    {
      hits: []
    }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>
      <h1 className="hp-color center-text">Spells from the Harry Potter universe</h1>
      <div className="btn-group me-2 center-div" role="group" aria-label="First group">
        <button type="button" value="All" className="btn btn-warning" onClick={event => {doFetch(`https://wizard-world-api.herokuapp.com/Spells`),event.preventDefault();}}>All</button>
        {
        types.map(item => (
          <button type="button" value= {item} className="btn btn-warning" onClick={event => {doFetch(`https://wizard-world-api.herokuapp.com/Spells?Type=${item}`),event.preventDefault();}}>{item}</button>
        ))
        }
      </div>
      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <table className="table table-hover table-dark">
          <thead className="thead-light">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Effect</th>
              <th scope="col">Incantation</th>
              <th scope="col">Type</th>
            </tr>
          </thead>
          {page.map(item => (
            <tr key={item.ID}>
              <td>{item.name}</td>
              <td>{item.effect}</td>
              <td>{item.incantation}</td>
              <td>{item.type}</td>
            </tr>
          ))}
        </table>
      )}
      <Pagination
        items={data.hits}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
