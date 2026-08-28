import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Login from './login.jsx';
import Signup from './signup.jsx';
import Generator from './generator.jsx';
import History from './history.jsx';
import ProtectedRoute from './Protected.jsx';


function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Navigate to="/login"/>}/>
    <Route path='/login' element={<Login/>}/>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/generator" element={
      <ProtectedRoute>
        <Generator/>
      </ProtectedRoute>
    }/>
    <Route path='/history' element={
      <ProtectedRoute>
        <History/>
        
      </ProtectedRoute>
    }/>
    </Routes></BrowserRouter>
  );
}

export default App;