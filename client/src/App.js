import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import ArtystRoutes from './Routes';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className='App dark'>
          <ArtystRoutes />
        </div>
      </Router>
    </Provider>
  );
}

export default App;