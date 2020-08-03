<?php
namespace Api\Resources;

use Api\Schemas;

class Attempt extends Resource implements Schemas\Attempt {
    protected $Attempt;

    public function __construct($attempt){
        parent::__construct($attempt);
        if(is_null($attempt)) throw new \Exception('$attempt nie może być null.');
        $this->Attempt = $attempt;
    }

    public function GetKeys(): array{
        return [
            'id',
            'user',
            'score',
            'max_score',
            'begin_time'
        ];
    }

    public function id(): int{
        return $this->Attempt->GetId();
    }

    public function user(): Schemas\User{
        $u = new User($this->Attempt->GetUser());
        $u->SetContext($this->GetContext());
        return $u;
    }

    public function score(): ?float{
        return $this->Attempt->GetScore();
    }

    public function max_score(): float{
        return $this->Attempt->GetMaxScore();
    }

    public function begin_time(): \DateTime{
        return $this->Attempt->GetBeginTime();
    }

    public function questions(): ?Schemas\Collection{
        return null;
    }

    public function path(): ?array{
        return null;
    }

    public function answers(){
        $aa = new AttemptAnswers($this->Attempt);
        $aa->SetContext($this->GetContext());
        return $aa;
    }
}
?>