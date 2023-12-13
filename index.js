const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;



//middleware
app.use(cors())
app.use(express.json())



//database


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.khygiij.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        //collections

        const itemCollection = client.db('myDB').collection('shoes');
        const categoryCollection = client.db('myDB').collection('category');
        const userCollection = client.db('myDB').collection('users');
        const cartCollection = client.db('myDB').collection('cart');
        const reviewCollection = client.db('myDB').collection('reviews');
        const wishlistCollection = client.db('myDB').collection('wishlist');



        //get products data

        app.get('/shoes', async (req, res) => {
            const result = await itemCollection.find().toArray();
            res.send(result)
        })


        //get category data
        app.get('/category', async (req, res) => {
            const result = await categoryCollection.find().toArray();
            res.send(result);
        })


        //post user

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })


        //my cart
        app.post('/cart', async (req, res) => {
            const cart = req.body;
            const result = await cartCollection.insertOne(cart);
            res.send(result);
        })

        //get my cart
        app.get('/cart', async (req, res) => {
            const cart = await cartCollection.find().toArray();
            res.send(cart);
        });

        //get my carted item by email
        app.get('/cart/:email', async (req, res) => {
            const userEmail = req.params.email;
            const cart = await cartCollection.find({ email: userEmail }).toArray();
            res.send(cart);
        });


        //delet from my cart 

        app.delete('/cart/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await cartCollection.deleteOne(query);
                console.log(result);  // Log the result to see if it's successful
                res.send({ success: true, message: 'Item deleted successfully' });
            } catch (error) {
                console.error('Error deleting item:', error);
                res.status(500).send({ success: false, message: 'Failed to delete item' });
            }
        });



        // Update quantity in cart
        app.put('/cart/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const { quantity } = req.body;

                // Validate quantity
                if (typeof quantity !== 'number' || quantity <= 0) {
                    return res.status(400).send({ success: false, message: 'Invalid quantity value' });
                }

                const query = { _id: new ObjectId(id) };

                // Fetch the current cart item
                const currentItem = await cartCollection.findOne(query);

                // Calculate the new total price based on the updated quantity
                const newTotalPrice = currentItem.price * quantity;

                const update = {
                    $set: {
                        quantity: quantity,
                        totalPrice: newTotalPrice,
                    },
                };

                const result = await cartCollection.updateOne(query, update);

                if (result.matchedCount > 0) {
                    res.send({ success: true, message: 'Item quantity updated successfully' });
                } else {
                    res.status(404).send({ success: false, message: 'Item not found' });
                }
            } catch (error) {

                res.status(500).send({ success: false, message: 'Failed to update item quantity' });
            }
        });






        //post review

        app.post('/reviews', async (req, res) => {
            const item = req.body;
            const result = await reviewCollection.insertOne(item);
            res.send(result)
        })

        //get review by product ID


        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);

        });



        //post wishlist
        app.post('/wishlist', async (req, res) => {
            const item = req.body;
            const result = await wishlistCollection.insertOne(item);
            res.send(result)
        })

        //get wishlist data by email

        app.get('/wishlist/:email', async (req, res) => {
            const email = req.params.email;
            const result = await wishlistCollection.find({ email: email }).toArray();
            res.send(result);
        });

        //delete wishlist
        app.delete('/wishlist/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await wishlistCollection.deleteOne(query);
                console.log(result);  // Log the result to see if it's successful
                res.send({ success: true, message: 'Item deleted successfully' });
            } catch (error) {
                console.error('Error deleting item:', error);
                res.status(500).send({ success: false, message: 'Failed to delete item' });
            }
        });














        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', async (req, res) => {
    res.send('Nike store server is running')
})

app.listen(port, (req, res) => {
    console.log(`server running at port:${port}`);
})