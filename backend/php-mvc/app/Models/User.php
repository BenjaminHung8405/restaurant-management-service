<?php

namespace App\Models;

class User extends BaseModel
{
    protected $table = 'users';

    public function findByEmail($email)
    {
        $sql = 'SELECT * FROM ' . $this->table . ' WHERE email = :email LIMIT 1';
        $statement = $this->db->prepare($sql);
        $statement->execute(array('email' => $email));

        return $statement->fetch();
    }
}
