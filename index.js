const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

const blogs = require('./data/blog.json');

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oeh6vj2.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();

		const productCollection = client.db('kidzland').collection('products');
		// Creating index
		// const indexKeys = { name: 1 };
		// const indexOptions = { name: 'nameCategory' };
		// const result = await productCollection.createIndex(indexKeys, indexOptions);
		// console.log(result);

		// app.get('/products', async (req, res) => {
		// 	const cursor = productCollection.find();
		// 	const result = await cursor.toArray();
		// 	res.send(result);
		// });

		// Add toy
		app.post('/products', async (req, res) => {
			const toy = req.body;
			const result = await productCollection.insertOne(toy);
			res.send(result);
		});

		//show a single toy
		app.get('/products/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			// const options = {
			// 	projection: {
			// 		name: 1,
			// 		price: 1,
			// 		sellerName: 1,
			// 		sellerEmail: 1,
			// 		rating: 1,
			// 		availableQuantity: 1,
			// 		photo: 1,
			// 		description: 1,
			// 	},
			// };
			const result = await productCollection.findOne(query);
			res.send(result);
		});

		//my toys

		app.get('/products', async (req, res) => {
			let query = {};
			if (req.query?.sellerEmail) {
				query = { sellerEmail: req.query?.sellerEmail };
			}

			const sort = {};

			if (req.query?.sort === 'asc') {
				sort.price = 1; // Sort in ascending order based on the "price" field
			} else if (req.query?.sort === 'desc') {
				sort.price = -1; // Sort in descending order based on the "price" field
			}

			const cursor = productCollection.find(query).sort(sort).limit(20);
			const result = await cursor.toArray();
			res.send(result);
		});

		app.delete('/products/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await productCollection.deleteOne(query);
			res.send(result);
		});

		app.put('/updateToy/:id', async (req, res) => {
			const id = req.params.id;
			const body = req.body;
			// console.log(body);
			const filter = { _id: new ObjectId(id) };
			const updateData = {
				$set: {
					id: body._id,
					photo: body.photo,
					name: body.name,
					subCategory: body.ubCategory,
					sellerName: body.sellerName,
					price: body.price,
					availableQuantity: body.availableQuantity,
					description: body.description,
				},
			};
			const result = await productCollection.updateOne(filter, updateData);
			res.send(result);
		});

		app.get('/getProductByText/:searchText', async (req, res) => {
			const searchText = req.params.searchText;
			const result = await productCollection
				.find({
					$or: [{ name: { $regex: searchText, $options: 'i' } }],
				})
				.toArray();
			res.send(result);
		});

		app.get('/getProductsBySubCategory/:subCategory', async (req, res) => {
			let query;
			if (req.params.subCategory) {
				query = { subCategory: req.params.subCategory };
			}
			const result = await productCollection.find(query).toArray();
			res.send(result);
		});

		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get('/blogs', (req, res) => {
	res.send(blogs);
});
app.get('/', (req, res) => {
	res.send('kidzland is running ');
});

app.listen(port, () => {
	console.log('kidzland is running at port: ', port);
});
