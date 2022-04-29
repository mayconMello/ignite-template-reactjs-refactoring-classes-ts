import { useEffect, useState } from 'react';
import { Food } from '../../components/Food';
import { Header } from '../../components/Header';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { api } from '../../services/api';
import { FoodsContainer } from './styles';

interface FoodData {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

export function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false)
  const [foods, setFoods] = useState<FoodData[]>([])
  const [editingFood, setEditingFood] = useState<FoodData>({} as FoodData)
  const [editModalOpen, setEditModalOpen] = useState(false)


  useEffect(() => {
    (
      async function fetch() {
        const { data } = await api.get<FoodData[]>('/foods')

        setFoods(data)
      }
    )()
  }, [])

  const handleAddFood = async (food: FoodData) => {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data])
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodData) => {
    if (!editingFood) return;
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated)

    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: number) => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  const handleEditFood = (food: FoodData) => {
    setEditingFood(food)
    setEditModalOpen(true)
  }

  return (
    <>
      <Header openModal={() => setModalOpen(!modalOpen)} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={() => setModalOpen(!modalOpen)}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={() => setEditModalOpen(!editModalOpen)}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}