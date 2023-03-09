const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const {axios} = require('axios');

const app = express();


const PORT = 3030;
const limiter = rateLimit({
	windowMs: 2 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})

app.use(morgan('combined'));
app.use(limiter);
app.use('/bookingService', createProxyMiddleware({ target: 'http://localhost:5050/', changeOrigin: true }));
app.use('/bookingService', async(req, res, next)=>{
	//console.log(req.headers['x-access-token']);
     try {
		const response = await axios.get('http://localhost:3303/api/v1/isauthenticated',{
		headers :{
			'x-access-token': req.headers['x-access-token']
		}
	});
	
	console.log(response.data);
	if(response.data.success){
		next();
	}else{
		return res.status(401).json({
			message:'Unauthorised token'
		})
		
	}
	 } catch (error) {
		return res.status(500).json({
			message:'Something went wrong'
		})
		
	 }
	
	

});


app.get('/home', (req, res)=>{
return res.json({ message : 'OK'});
});


app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
});

