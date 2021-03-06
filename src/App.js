import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from'./components/Navigation/Navigation';
import Signin from'./components/Signin/Signin';
import Register from'./components/Register/Register';
import Logo from'./components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

import './App.css';



const particlesOptions = {
  "particles":{
    number :{
      value:100,
      density:{
        enable : true,
        value_area:800
      }
    },
   size:{
      value : 2,
   }, 
  }
}

const initialState={
  input:'',
  imageUrl:'',
  box:{},
  route:'signin',
  isSignedIn:false,
  user:{
    id: '',
    name: '',
    email: '',
    password: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component{
  constructor(){
    super();
    this.state={
      input:'',
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedIn:false,
      user:{
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser=(userdata)=>{
    this.setState({
      user:{
        id: userdata.id,
        name: userdata.name,
        email: userdata.email,
        password: userdata.password,
        entries: userdata.entries,
        joined: userdata.joined
      }
    })
  }

  calculateFaceLocation = (data)=>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol : width - (clarifaiFace.right_col*width),
      bottomRow: height - (clarifaiFace.bottom_row*height),
    }
  }

  displayFaceBox=(box)=>{
    this.setState({box: box})
  }
  onInputChange=(event)=>{
    this.setState({input: event.target.value});
  }

  onButtonSubmit=()=>{
    this.setState({imageUrl:this.state.input});
    fetch('https://cherry-cupcake-87697.herokuapp.com/imageurl',{
      method:'post',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        input:this.state.input
      })
    }) 
    .then(response => response.json())
    .then(response =>{
      if(response){
        fetch('https://cherry-cupcake-87697.herokuapp.com/image',{
          method:'put',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            id:this.state.user.id
          })
        })  
        .then(response=> response.json())
        .then(count=>{
          this.setState(Object.assign(this.state.user,{entries:count}))
        })
        .catch(err=> console.log(err))
      }
      this.displayFaceBox(this.calculateFaceLocation(response))})
    .catch(err=> console.log(err));  
  }

  onRouteChange=(route)=>{
    if(route === 'signout'){
      this.setState(initialState)
    }else if(route ==='home'){
      this.setState({isSignedIn:true})  
    }
    this.setState({route: route});
  }

  render(){
    const {isSignedIn,imageUrl,route,box} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params = {particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home'? 
          <div>
            <Logo/>
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={ imageUrl}/>
          </div>
          : 
          (
              route === 'signin' ? 
            <Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/> 
            :
            <Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}
export default App;
