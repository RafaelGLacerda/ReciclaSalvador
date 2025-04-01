import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const recyclePoints = [
  { id: 1, name: "Campo Grande", lat: -12.988572736686292, lng: -38.520103895353984 },
  { id: 2, name: "Ondina", lat: -13.0115, lng: -38.4995 },
  { id: 3, name: "Rio Vermelho", lat: -13.0102, lng: -38.4866 },
  { id: 4, name: "Brotas", lat: -12.985138018320063, lng: -38.501248250615475 },
  { id: 5, name: "Pituba", lat: -13.000812913502605, lng: -38.45969249204836 },
  { id: 6, name: "Pernambués", lat: -12.972252437839018, lng: -38.461392333116734 },
  { id: 7, name: "Imbuí", lat: -12.970897156797012, lng: -38.43489105185892 },
  { id: 8, name: "Sussuarana", lat: -12.933550563139878, lng: -38.444129692500596 },
  { id: 9, name: "São Cristóvão", lat: -12.91040561999883, lng: -38.353779377995345 },
  { id: 10, name: "Cajazeiras", lat: -12.899468912209896, lng: -38.4077516879381 }
];

const pointsPerKg = { plastic: 10, paper: 5, glass: 15, metal: 20 };
const materialTypes = Object.keys(pointsPerKg);

const rewards = [
  { name: "Conjunto de Talheres", points: 2000 },
  { name: "Vale Refeição R$50", points: 2000 },
  { name: "Sanduicheira", points: 5000 },
  { name: "Liquidificador", points: 5000 },
  { name: "Panela Antiaderente", points: 5000 },
  { name: "Vale Refeição R$500", points: 9250 },
  { name: "Airfryer", points: 10000 }
];

const App = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [user, setUser] = useState({ name: "Usuário", collected: 0 });
  const [menu, setMenu] = useState("perfil");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Recupera pontos do localStorage ao carregar a página
  useEffect(() => {
    const savedPoints = localStorage.getItem('userPoints');
    const savedUser = localStorage.getItem('user');
    if (savedPoints) {
      setUserPoints(parseInt(savedPoints));
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Salva os pontos no localStorage sempre que eles são atualizados
  useEffect(() => {
    localStorage.setItem('userPoints', userPoints);
  }, [userPoints]);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const handleRecycle = (amount, type) => {
    if (isNaN(amount) || amount <= 0) return;
    const newPoints = (pointsPerKg[type] * amount) / 1000;
    setUserPoints(userPoints + newPoints);
    setUser({ ...user, collected: user.collected + amount });
  };

  const handleRedeemReward = (reward) => {
    if (userPoints >= reward.points) {
      setUserPoints(userPoints - reward.points);
      alert(`Você resgatou: ${reward.name}`);
    } else {
      alert(`Você não tem pontos suficientes para resgatar ${reward.name}.`);
    }
  };

  const formatWeight = (grams) => {
    if (grams === 0) return "0 kg";
    const kg = Math.floor(grams / 1000);
    const g = grams % 1000;
    return `${kg} kg e ${g} g`;
  };

  const handleLogout = () => {
    // Limpa as informações do usuário e pontos no estado e no localStorage
    setUser({ name: "Usuário", collected: 0 });
    setUserPoints(0);
    localStorage.removeItem('user');
    localStorage.removeItem('userPoints');
    
    // Realiza o logout do Google
    googleLogout();
  };

  return (
    <GoogleOAuthProvider clientId="183318539592-83o8c6d9arv1v527oou9eheemsndhenm.apps.googleusercontent.com">
      <div className={`container ${sidebarOpen ? "" : "full-screen"}`}>
        <nav className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "⏪" : "☰"}
          </button>
          {sidebarOpen && (
            <>
              <GoogleLogin
                className="google-login-button"
                onSuccess={(response) => {
                  console.log("Google Response:", response);
                  const decoded = jwtDecode(response.credential);
                  console.log("Decoded:", decoded);
                  setUser({ ...user, name: `${decoded.given_name} ${decoded.family_name}` });
                }}
                onError={() => console.log("Login Failed")}
              />
              <button onClick={handleLogout}>Sair</button>
              <button onClick={() => setMenu("perfil")}>Perfil</button>
              <button onClick={() => setMenu("reciclagem")}>Reciclagem</button>
              <button onClick={() => setMenu("premiacao")}>Premiação</button>
              <button onClick={() => setMenu("conscientizacao")}>Conscientização</button>
            </>
          )}
        </nav>
        <div className="content">
          {menu === "perfil" && (
            <div>
              <h1>Perfil</h1>
              <p>Bem-vindo, {user.name}!</p>
              <p>Pontos: {userPoints.toLocaleString("pt-BR")}</p>
              <p>Material reciclado: {formatWeight(user.collected)}</p>
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
              {materialTypes.map((type) => (
                <div key={type} className="recycle-box">
                  <h3>Reciclar {type}</h3>
                  <input type="number" placeholder="Quantidade (g)" id={`recycleAmount-${type}`} className="input-recycle" />
                  <button onClick={() => handleRecycle(parseInt(document.getElementById(`recycleAmount-${type}`).value), type)}>
                    Reciclar {type}
                  </button>
                </div>
              ))}
            </div>
          )}
          {menu === "premiacao" && (
            <div>
              <h1>Premiação</h1>
              <ul>
                {rewards.map((reward) => (
                  <li key={reward.name}>
                    <div className="reward-item">
                      <span>{reward.name}</span>
                      <span className="reward-points">{reward.points.toLocaleString("pt-BR")} pontos</span>
                      {userPoints >= reward.points ? (
                        <button onClick={() => handleRedeemReward(reward)}>Resgatar</button>
                      ) : (
                        <span className="insufficient-points"> (Pontos insuficientes)</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
  {sidebarOpen ? "⏪" : "☰"}
</button>

{menu === "conscientizacao" && (
  <div className="conscientizacao">
    <h1>Conscientização</h1>
    <p><strong>Transforme seus hábitos, transforme o mundo! 🌍</strong></p>
    
    <p>
      A reciclagem é uma prática essencial para a preservação do meio ambiente e para a criação de um futuro mais sustentável para as próximas gerações. 
      A cada ano, milhões de toneladas de resíduos são descartados de maneira inadequada, impactando diretamente a natureza e a vida dos seres vivos. 
      Reciclar não é apenas um ato de responsabilidade, mas também um passo fundamental para a conservação dos recursos naturais e a diminuição da poluição.
    </p>

    <h2>Impactos da reciclagem no meio ambiente</h2>
    <p>
      A reciclagem de materiais como plástico, vidro, papel e metal pode reduzir significativamente o impacto ambiental. 
      Por exemplo, reciclar uma tonelada de papel pode salvar até 17 árvores e economizar cerca de 7.000 galões de água. Já a reciclagem de plásticos pode diminuir a quantidade de resíduos sólidos em aterros e reduzir a necessidade de novos materiais, que muitas vezes são produzidos de maneira poluente e intensiva em recursos.
    </p>

    <h2>Estatísticas importantes</h2>
    <ul>
      <li>
        <strong>Plástico:</strong> Mais de 300 milhões de toneladas de plástico são produzidas anualmente no mundo, e cerca de 79% disso vai parar em aterros sanitários ou no meio ambiente.
      </li>
      <li>
        <strong>Papel:</strong> A reciclagem de uma tonelada de papel economiza cerca de 2.500 kWh de energia, o que equivale ao consumo de energia de uma residência durante 3 meses.
      </li>
      <li>
        <strong>Vidro:</strong> O vidro pode ser reciclado infinitamente sem perder qualidade, e reciclar vidro consome 40% menos energia do que produzir vidro novo.
      </li>
      <li>
        <strong>Metais:</strong> A reciclagem de metais como o alumínio pode economizar até 95% da energia necessária para a produção de metais novos, além de reduzir a necessidade de mineração.
      </li>
    </ul>

    <h2>Cuidados ao reciclar</h2>
    <p>
      A reciclagem pode ser simples, mas requer alguns cuidados para garantir sua eficiência. Primeiro, é importante separar corretamente os materiais recicláveis, pois misturá-los pode tornar o processo mais difícil e até inviável. Certifique-se de limpar os itens recicláveis, especialmente plásticos e vidros, para evitar a contaminação de outros materiais.
    </p>
    <p>
      Além disso, evite descartar materiais não recicláveis nos pontos de coleta, como filmes plásticos, papéis laminados e embalagens de comida com resíduos orgânicos. Esses itens podem dificultar o processo de reciclagem e contaminar materiais que poderiam ser reciclados corretamente.
    </p>

    <h2>Motivação para a mudança</h2>
    <p>
      Cada pequena ação conta. Se todos fizerem sua parte, podemos reduzir o impacto do lixo no meio ambiente, diminuir a quantidade de recursos desperdiçados e criar um mundo mais limpo e saudável. A reciclagem é uma das formas mais acessíveis de contribuir para a preservação do planeta. 
      Ao se engajar na reciclagem, você está não apenas protegendo a natureza, mas também contribuindo para a economia circular, onde os materiais são reutilizados e transformados em novos produtos.
    </p>

    <p>
      Não subestime o poder do seu gesto! Ao fazer escolhas conscientes no dia a dia, como separar corretamente o lixo e consumir de maneira mais responsável, você ajuda a garantir um futuro mais verde para todos. A reciclagem é o primeiro passo para um mundo mais sustentável, e ele começa com você!
    </p>

    <h2>Juntos somos mais fortes!</h2>
    <p>
      Se cada pessoa se comprometer a dar sua contribuição para o meio ambiente, seremos capazes de transformar o mundo em um lugar melhor para as futuras gerações. A reciclagem é uma das formas mais simples de começar essa transformação. Comece hoje, recicle mais e incentive os outros a fazerem o mesmo. O futuro do nosso planeta depende de nossas ações agora!
    </p>
  </div>
)}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
