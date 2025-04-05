import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderDetails, payOrder } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ... existing code ... 