Guía de como usar el rescatador de tokens Linea de una wallet comprometida.

Paso 1: Crear un RPC personalizado para el claim (los RPC públicos se colapsarán). Ir a https://developer.metamask.io/key/active-endpoints y copiar esto. 

<img width="901" height="231" alt="imagen" src="https://github.com/user-attachments/assets/9d9a15b6-9731-4679-ab6d-43ad7062be0e" />


Paso 2: Descargar el código como ZIP. Crear carpeta "rescue_linea_tokens" en tu escritorio y extrae los ficheros del ZIP.

Paso 3: Descargar nodeJS. Se utilizará para levantar un servidor local y que el código funcione rápido y sin retrasos ni problemas de servidores. Descargar desde aquí https://nodejs.org/es/download o buscando "nodejs" en Google.

Paso 4: Abrir CMD y escribir <pre>```cd C:\Users\"tu usuario"\Desktop\rescue_linea_tokens```</pre> Cambiar "tu usuario" por el nombre de tu usuario de windows sin las comillas.

Paso 5: Editar el RPC, Clave privada de la wallet origen y dirección de la wallet destino del código. En ambos ficheros has de modificar las constantes "provider, privateKey y DESTINO".

<img width="531" height="342" alt="imagen" src="https://github.com/user-attachments/assets/6bff901a-9d94-4624-a2e9-695bb114561c" />


Paso 6: En este paso tenemos dos escenarios posibles.

<pre>npm install</pre>

- Escenario 1: Tu wallet tiene un drainer en el token ETH (el más común). En este caso, has de escribir en el CMD el comando: <pre>```node claimAndSendLineaTokensToSafeWallet```</pre> Con esto ejecutarás automatizarás el claim una vez inicie y en cuanto se claimee, mandará los tokens a tu wallet destino. Para más seguridad, te aconsejo ejecutar también, en otra consola el otro fichero con el comando: <pre>```node sniperLikeTokenAndTransfer```</pre> Así te aseguras que en cuanto lleguen los tokens Linea a tu wallet comprometida, se enviarán automaticamente a tu wallet destino.

- Escenario 2: Tu wallet tiene un drainer en el token ETH, también en el token Linea o tu clave privada está comprometida. En este caso, primero antes de nada ejecuta el comando <pre>```node sniperLikeTokenAndTransfer```</pre> Así este bot se quedará escuchando y en cuanto lleguen los tokens Linea a tu cuenta se transferirán a tu cuenta destino. Es más rapido que los drainers y también te aseguras que si otra persona está intentando claimear, acaben en tu wallet. Después, en otra consola CMD ejecuta el comando <pre>```node claimAndSendLineaTokensToSafeWallet```</pre> para hacer todo el proceso de claimear el airdrop y demás.

⚠️ A tener en cuenta: Como las wallet comprometidas tienen un drainer de ETH, has de ejecutar los comandos antes de enviar ETH a la wallet, para que el flashbot del código se adelante a los drainers. Una vez haga el claim, tendrás que mandar ETH de nuevo para que envíe los tokens Linea a tu wallet segura.

Si el código te ha servido y has podido claimear el airdrop de linea, te agradecería un pequeño % del airdrop como donación a <pre>```0x25CE41a5D862F81FfEd8870ba7fEf313119AF340```</pre>

Cualquier duda del bot, puedes contactarme vía telegram @Adromicfms o vía X @0xAdromicfms.

- Jagcweb.
