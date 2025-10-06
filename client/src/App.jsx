import Model from "./components/Model";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      <Model />
      <ToastContainer autoClose={3000} />
    </div>
  );
}

export default App;
