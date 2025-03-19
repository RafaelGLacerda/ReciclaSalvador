import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const recyclePoints = [
  { id: 1, name: "Campo Grande", lat: -12.9777, lng: -38.5146 },
  { id: 2, name: "Barra", lat: -13.0115, lng: -38.4995 },
  { id: 3, name: "Rio Vermelho", lat: -13.0102, lng: -38.4866 },
  { id: 4, name: "Brotas", lat: -12.9563, lng: -38.4777 },
  { id: 5, name: "Pituba", lat: -12.9859, lng: -38.4608 },
  { id: 6, name: "Itaigara", lat: -12.9996, lng: -38.4594 },
  { id: 7, name: "Paralela", lat: -12.9243, lng: -38.4128 },
  { id: 8, name: "Stiep", lat: -12.9941, lng: -38.4411 },
  { id: 9, name: "Imbuí", lat: -12.9647, lng: -38.4379 },
  { id: 10, name: "Cabula", lat: -12.9362, lng: -38.4497 }
];

const rewards = [
  { id: 1, name: "Kit de Facas", points: 500, image: "https://upload.wikimedia.org/wikipedia/commons/3/39/Chef%27s_knife.jpg" },
  { id: 2, name: "Liquidificador", points: 1000, image: "https://upload.wikimedia.org/wikipedia/commons/6/66/Blender_3D.jpg" },
  { id: 3, name: "Airfryer", points: 5000, image: "https://upload.wikimedia.org/wikipedia/commons/3/32/Air_fryer.jpg" },
];

const App = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [user, setUser] = useState({ name: "Usuário", collected: 0 });
  const [menu, setMenu] = useState("perfil");

  const handleRecycle = (amount, type) => {
    const pointsPerKg = { plastic: 10, paper: 8, glass: 20, metal: 25 };
    const newPoints = pointsPerKg[type] * amount;
    setUserPoints(userPoints + newPoints);
    setUser({ ...user, collected: user.collected + amount });
  };

  const redeemReward = (reward) => {
    if (userPoints >= reward.points) {
      setUserPoints(userPoints - reward.points);
      alert(`Você resgatou: ${reward.name}!`);
    }
  };

  return (
    <div className="container">
      <nav className="sidebar">
        <button onClick={() => setMenu("perfil")}>Perfil</button>
        <button onClick={() => setMenu("reciclagem")}>Reciclagem</button>
        <button onClick={() => setMenu("recompensas")}>Recompensas</button>
      </nav>
      <div className="content">
        {menu === "perfil" && (
          <div>
            <h1>Perfil</h1>
            <p>Bem-vindo, {user.name}!</p>
            <p>Pontos: {userPoints}</p>
            <p>Material reciclado: {user.collected} kg</p>
          </div>
        )}
        {menu === "reciclagem" && (
          <div>
            <h1>Reciclagem</h1>
            <MapContainer center={[-12.9714, -38.5014]} zoom={13} className="map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {recyclePoints.map((point) => (
                <Marker key={point.id} position={[point.lat, point.lng]}>
                  <Popup>{point.name}</Popup>
                </Marker>
              ))}
            </MapContainer>
            <button onClick={() => handleRecycle(1, "plastic")}>Reciclar 1kg de Plástico</button>
            <button onClick={() => handleRecycle(1, "paper")}>Reciclar 1kg de Papel</button>
            <button onClick={() => handleRecycle(1, "glass")}>Reciclar 1kg de Vidro</button>
            <button onClick={() => handleRecycle(1, "metal")}>Reciclar 1kg de Metal</button>
          </div>
        )}
        {menu === "recompensas" && (
          <div>
            <h1>Recompensas</h1>
            <ul>
              {rewards.map((reward) => (
                <li key={reward.id}>
                  <img src={reward.image} alt={reward.name} width="50" />
                  {reward.name} - {reward.points} pontos
                  {userPoints >= reward.points ? (
                    <button onClick={() => redeemReward(reward)}>Resgatar</button>
                  ) : (
                    <span>Você precisa de mais pontos</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
