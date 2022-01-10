import React, {useEffect, useState} from "react"
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import axios from 'axios';

import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'

import styles from '../styles/Home.module.css'

const isBrowser = () => typeof window !== "undefined"
export default function Home() {
  const isBrowser = () => typeof window !== "undefined"
  const DefaultHeader = isBrowser() ? { "authorization": "Token " + localStorage.getItem('token') } : ''
  const login_credentials = DefaultHeader.authorization !== "Token null" ? DefaultHeader : ''

  let router = useRouter()
  const { redirection_url } = router.query

  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [user, setUser] = useState({})
  const [products, setProducts] = useState([])

  useEffect(() => {
    if (isBrowser()) {
      let value = localStorage.getItem('token')
      if (value && value !== undefined && value !== 'undefined' && value !== null && value.length > 5 && value != '') {
        fetchUser()
      } else {
        setIsLoggedIn(false)
      }
    }
  }, [isBrowser() ? localStorage.getItem('token') : ''])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push(`/login`)
    }
  }, [isBrowser(),redirection_url,isLoggedIn])

  async function fetchUser() {
    axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/api/auth/user`, {headers: login_credentials}).then(res => {
      setUser(res.data)
      if(res.data.account_type !== '2') {
        fetchProducts()
      }
    }).catch(error => {
      setUser({});
    })
  }

  async function fetchProducts() {
    axios.get(`${process.env.NEXT_PUBLIC_API_HOST}/product/`, {headers: login_credentials}).then(res => {
      setProducts(res.data)
    }).catch(error => {
      setProducts([]);
    })
  }

  async function deleteProduct(id) {
    axios.delete(`${process.env.NEXT_PUBLIC_API_HOST}/product/${id}/`, {headers: login_credentials}).then(res => {
      let product_data = [...products]
      let deleted_product_index = product_data.findIndex((element) => element.id === id)
      product_data.splice(deleted_product_index, 1)
      setProducts(product_data)
    }).catch(error => {
      if(error.response){
        // let error_messages = error.response.statusText + "<br>"
        let error_messages =''
        for (var key in error.response.data){
          error_messages += error.response.data[key] 
        }
        document.getElementById("error-div").innerText =error_messages;
      }
    })
  }

  async function createProduct(event) {
    event.preventDefault();

    const { name, description } = event.target;
    var formData = new FormData();
    formData.append('name', name.value);
    formData.append('description', description.value);
    formData.append('owner', user.id);

    axios.post(`${process.env.NEXT_PUBLIC_API_HOST}/product/`, formData, { headers: login_credentials })
    .then(res => {
      let products_data = [...products]
      products_data.unshift(res.data)
      setProducts(products_data)
    }).catch(error => {
      if(error.response){
        // let error_messages = error.response.statusText + "<br>"
        let error_messages =''
        for (var key in error.response.data){
          error_messages += error.response.data[key] 
        }
        document.getElementById("error-div").innerText =error_messages;
      }
    });
  }

  async function handleUpdate(event,id) {
    event.preventDefault();
    var formData = new FormData();
    formData.append(event.target.name, event.target.value);

    axios.put(`${process.env.NEXT_PUBLIC_API_HOST}/product/${id}/`, formData, { headers: login_credentials })
    .then(res => {
    }).catch(error => {
      if(error.response){
        // let error_messages = error.response.statusText + "<br>"
        let error_messages =''
        for (var key in error.response.data){
          error_messages += error.response.data[key] 
        }
        document.getElementById("error-div").innerText =error_messages;
      }
    });
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Products</title>
        <meta name="description" content="Products Listing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Link href={`/logout`}> 
          <a className={`text-blue-1 underline`}>Logout </a> 
        </Link>
        Products
        {user.account_type === '0' ? <Form className={`text-left`} onSubmit={(e)=> createProduct(e)}>
          <Form.Group className="mb-3" controlId="formBasicName">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" name="name" placeholder="Name" required/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Description</Form.Label>
            <Form.Control type="text" name="description" placeholder="Enter Description" required/>
          </Form.Group>
          <Button variant="primary" type="submit">
            Create
          </Button>
        </Form> : null}
        <p id="error-div"></p>
        {products.map( (datum, index) => {
          return(
            <Card key={datum.id} style={{ width: '18rem' }}>
              <Card.Body>
                <input type="text" name="name" id={datum.id+`-name-input-id`} defaultValue={datum.name}
                  onChange={(e) => {handleUpdate(e,datum.id)}}
                  placeholder={"Enter Name"} disabled={user.account_type === '2'} required />
                <input type="text" name="description" id={datum.id+`-description-input-id`} defaultValue={datum.description}
                  onChange={(e) => {handleUpdate(e,datum.id)}}
                  placeholder={"Enter Description"} disabled={user.account_type === '2'} required />
                {user.account_type === '0' ? <Button className={`mt-2 py-0`} onClick={(e)=>{e.preventDefault();deleteProduct(datum.id)}}>Delete</Button> : null}
              </Card.Body>
            </Card>
          )
        })}
      </main>
    </div>
  )
}
