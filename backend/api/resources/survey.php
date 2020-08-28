<?php
namespace Api\Resources;

use Api\Schemas;

class Survey extends Resource implements Schemas\Survey{
    protected $Survey;

    public function GetKeys(): array{
        return [
            'id',
            'author_id',
            'name',
            'description'
        ];
    }

    public function __construct($survey){
        parent::__construct();

        $this->Survey = $survey;
    }

    public function id(): int{
        return $this->Survey->GetId();
    }

    public function author_id(): int{
        return $this->Survey->GetAuthor()->GetId();
    }

    public function name(): string{
        return $this->Survey->GetName();
    }

    public function description(): ?string{
        return $this->Survey->GetDescription();
    }
}
?>